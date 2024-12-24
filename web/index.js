// @ts-nocheck
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import mongoose from "mongoose";
import dotenv from "dotenv";
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";

import StoreSchema from "./mongoSchema.js";
import crypto from "crypto";

dotenv.config();

const algorithm = "aes-256-ctr"; // Encryption algorithm
const secretKey = process.env.SECRET_KEY; // Store securely in env variables
const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();
const Hash = {
  encrypt: (text) => {
    if (!text || typeof text !== "string") {
      throw new Error("Invalid text to encrypt");
    }
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      algorithm,
      // @ts-ignore
      Buffer.from(secretKey, "hex"),
      iv
    );
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return JSON.stringify({
      iv: iv.toString("hex"),
      content: encrypted.toString("hex"),
    });
  },

  decrypt: (hash) => {
    if (!hash || typeof hash !== "string") {
      throw new Error("Invalid hash to decrypt");
    }
    let parsedHash;
    try {
      parsedHash = JSON.parse(hash);
    } catch {
      throw new Error("Invalid JSON format for hash");
    }

    const decipher = crypto.createDecipheriv(
      algorithm,
      // @ts-ignore
      Buffer.from(secretKey, "hex"),
      Buffer.from(parsedHash.iv, "hex")
    );
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(parsedHash.content, "hex")),
      decipher.final(),
    ]);
    return decrypted.toString();
  },
};
// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js
// console.log(
//   "checkup of keys",
//   process.env.SHOPIFY_API_KEY,
//   process.env.SHOPIFY_MONGO_URI_MULTI_STORE_APP
// );
app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.get("/api/products/count", async (_req, res) => {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  const countData = await client.request(`
    query shopifyProductCount {
      productsCount {
        count
      }
    }
  `);

  res.status(200).send({ count: countData.data.productsCount.count });
});
app.get("/api/credentials", async (_req, res) => {
  try {
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    const session = res.locals.shopify.session;
    const { accessToken, shop } = session;

    // Fetch shop data
    const data = await client.query({
      data: {
        query: `
              query {
                app{
    appStoreAppUrl
    appStoreDeveloperUrl
    title
  }
              }
            `,
      },
    });
    console.log("checkouos", data.body.data.app);

    if (data?.body?.data?.app?.title) {
      dotenv.config({ path: `./.env.${data?.body?.data?.app?.title}` });
    }
    // res.status(200).send(data.body.data.shop);
    // Validate session and environment variables
    if (!process.env.SHOPIFY_API_KEY || !accessToken || !shop) {
      throw new Error("Missing required session or environment data");
    }

    console.log(
      "Session before encryption:",
      process.env.SHOPIFY_API_KEY,
      accessToken
    );

    // Encrypt the credentials
    const encryptedApiKey = Hash.encrypt(process.env.SHOPIFY_API_KEY);
    const encryptedApiSecret = Hash.encrypt(accessToken);

    console.log(
      "Encrypted API Key and Secret:",
      encryptedApiKey,
      encryptedApiSecret
    );

    // Check if shop entry exists
    const existingStore = await StoreSchema.findOne({ shopName: shop });

    if (existingStore) {
      // Shop exists; check if keys are different
      if (
        existingStore.apiKey !== encryptedApiKey ||
        existingStore.apiSecret !== encryptedApiSecret
      ) {
        // Update credentials
        existingStore.apiKey = encryptedApiKey;
        existingStore.apiSecret = encryptedApiSecret;
        await existingStore.save();

        console.log("Updated credentials:", existingStore);

        return res.status(200).send({
          status: true,
          message: "Credentials updated successfully",
        });
      }

      // No changes needed
      console.log("No changes required for the existing credentials.");
      return res.status(200).send({
        status: true,
        message: "No changes required. Credentials are up-to-date.",
      });
    }

    // If shop does not exist, create a new entry
    const store = new StoreSchema({
      apiKey: encryptedApiKey,
      apiSecret: encryptedApiSecret,
      shopName: shop,
    });

    await store.save();

    console.log("Saved new credentials:", store);

    res.status(200).send({
      status: true,
      message: "Credentials saved successfully",
    });
  } catch (error) {
    console.error("Error saving credentials:", error);
    res.status(500).send({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});
app.get("/api/shop/currency", async (_req, res) => {
  try {
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    // Fetch shop data
    const data = await client.query({
      data: {
        query: `
          query {
            shop {
              name
              email
              currencyCode
              currencyFormats{
      moneyFormat
    }
            }
          }
        `,
      },
    });

    res.status(200).send(data.body.data.shop);
  } catch (error) {
    console.error("Error getting shop data:", error);
    res.status(500).send({ message: "Failed to fetch shop data" });
  }
});
app.get("/api/userShop", async (_req, res) => {
  try {
    const client = await shopify.api.rest.Shop.all({
      session: res.locals.shopify.session,
    });

    res.status(200).send({
      status: true,
      message: "Shop Details retrieved successfully",
      data: client.data[0],
    });
  } catch (error) {
    res
      .status(500)
      .send({ status: false, message: "Internal Server Error", error: error });
  }
});
app.post("/api/products", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

// @ts-ignore
app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

mongoose
  .connect(`${process.env.SHOPIFY_MONGO_URI_MULTI_STORE_APP}`)
  .then(() => {
    app.listen(process.env.PORT || PORT, () => {
      console.log(
        `Database Connected Successfully and server is listening on this port ${
          process.env.PORT || PORT
        }`
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });
// app.listen(process.env.PORT || PORT, () => {
//   console.log(
//     `Database Connected Successfully and server is listening on this port ${
//       process.env.PORT || PORT
//     }`
//   );
// });
