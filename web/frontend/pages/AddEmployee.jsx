import {
  AlphaCard,
  Banner,
  Button,
  Card,
  FormLayout,
  Icon,
  LegacyCard,
  LegacyStack,
  Page,
  PageActions,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
import spinner from "../assets/spin.gif";
import { ArrowLeftIcon, BugIcon, ChevronLeftIcon } from "@shopify/polaris-icons";
import React, { useCallback, useEffect, useState } from "react";
import { t } from "i18next";

export default function AddEmployee() {
  const [employeeData, setEmployeeData] = useState({ discountType: "percentage" });
  const [employeeEmailError, setEmployeeEmailError] = useState(false);
  const [employeeDiscountValueError, setEmployeeDiscountValueError] = useState(false);
  const [employeeCapError, setEmployeeCapError] = useState(false);
  const [dismissBanner, setDismissBanner] = useState(true);
  const [loading, setloading] = useState(false);
  const [maxCap, setMaxCap] = useState(false);
  const [maxGrade, setMaxGrade] = useState(false);
  const [currencyCode, setCurrencyCode] = useState(null);
  const [emailValidationMesage, setEmailValidationMesage] = useState(null);
  const [selected, setSelected] = useState('percentage');
  const options = [
    { label: 'Percentage', value: 'percentage' },
    { label: 'Fixed Amount', value: 'fixed_amount' },
  ];
  const defaultListStyle = {
    marginTop: "10px",
    marginBottom: "20px",
    fontSize: "12px",
    color: "gray",
    fontWeight: "500",
    marginLeft: "2px",
  };

  const bulletStyle = {
    display: "inline-block",
    // width: "1em",
    textAlign: "center",
    marginRight: "0.5em",
    fontSize: "1.2em", // Increase font size for a thicker appearance
    color: "black",
    fontWeight: "bold", // Make the bullet bolder
  };
  const [items, setItems] = useState(["Amount off products", "Code"]);
  const [items_two, setItems_two] = useState([
    "For Online Store",
    "Applies to one time purchases",
    "No minimum purchase requirement",
    `For ${employeeData.email ?? "Employee"}`,
    "Limit to 1 use, once per customer",
    "Can't combine with other discounts",
    "Discount Allocated based on available cap set by admin",
    "Over a month cap goes reset for particular employee",

  ]);

  const addItem = (newItem) => {
    setItems([...items, newItem]);
  };
  const addItem_two = (newItem) => {
    setItems_two([...items, newItem]);
  };
  const handleSelectChange = useCallback(
    (value) => {
      setSelected(value);
      handleSetEmployee("discountType", value)
    },
    [],
  );

  function checkEmailValidity(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check for presence of '@' symbol
    if (!email.includes("@")) {
      return {
        status: false,
        message: "Email is missing '@' symbol.",
      };
    }

    // Check if there's at least one character before '@'
    const parts = email.split("@");
    if (parts[0].length === 0) {
      return {
        status: false,
        message: "Email must contain characters before '@'.",
      };
    }

    // Check if there's a domain part after '@'
    if (parts[1].length === 0) {
      return {
        status: false,
        message: "Email must contain characters after '@'.",
      };
    }

    // Check if there's a '.' in the domain part
    if (!parts[1].includes(".")) {
      return {
        status: false,
        message: "Email must contain a '.' in the domain part.",
      };
    }

    // Ensure there's at least one character after the '.'
    const domainParts = parts[1].split(".");
    if (domainParts[domainParts.length - 1].length === 0) {
      return {
        status: false,
        message: "Email must contain characters after the '.'.",
      };
    }

    // Check if the email is valid
    if (!emailRegex.test(email)) {
      return {
        status: false,
        message: "Email format is invalid.",
      };
    }

    return {
      status: true,
      message: "Email is valid.",
    };
  }

  const handleSetEmployee = (key, value) => {

    if (key === "userCapTotal" && parseInt(value) < 1) return;
    if (key === "userCapTotal" && parseInt(value) > 100000) {
      setMaxCap(true);
      return;
    } else {
      setMaxCap(false);
      setMaxGrade(false);
    }

    setEmployeeData((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (employeeData.email) {
      setEmployeeEmailError(false);
    }
    if (employeeData.grade) {
      setEmployeeDiscountValueError(false);
    }
    if (employeeData.userCapTotal) {
      setEmployeeCapError(false);
    }
  };

  const handlePostEmployee = async () => {
    if (employeeData.email) {
      const emailValidate = checkEmailValidity(employeeData.email);
      if (!emailValidate.status) {
        return setEmailValidationMesage(emailValidate.message);
      } else {
        setEmailValidationMesage(null);
      }
    }

    if (!employeeData.email) {
      setEmployeeEmailError(true);
      return;
    } else {
      setEmployeeEmailError(false);
    }
    if (!employeeData.discountValue) {
      setEmployeeDiscountValueError(true);
      return;
    } else {
      setEmployeeDiscountValueError(false);
    }
    if (!employeeData.userCapTotal) {
      setEmployeeCapError(true);
      return;
    } else {
      setEmployeeCapError(false);
    }
    try {
      setloading(true);
      //https://employee-discount-backend.vercel.app
      const apiUrl = `https://multi-store-employee-discount-app.vercel.app/api/employee`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "api-key": `${process.env.EMPLOYEE_APP_BACKEND_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employeeData), // Convert the payload to JSON
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json(); // Parse JSON from the response
      console.log("is employee saved", data);
      if (data.status) {
        window.history.back();
      } else {
        setEmailValidationMesage(data.message);
      }
      setloading(false);
    } catch (error) {
      setloading(false);
      console.error("Error order discount create", error);
    }
  };
  const fetchUserShop = async () => {
    try {
      const apiUrl = `/api/userShop`;

      // const payload = { employeeEmail: userEmail };

      const response = await fetch(apiUrl, {
        headers: {
          // "api-key": `${process.env.EMPLOYEE_APP_BACKEND_KEY}`,
          "Content-Type": "application/json",
        },
      });

      // Check if the response is ok (status in the range 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json(); // Parse JSON from the response
      console.log("dtae", data.data.myshopify_domain);

      if (
        !(
          employeeData.hasOwnProperty("employeeAssociation") &&
          employeeData.employeeAssociation
        )
      ) {
        handleSetEmployee("employeeAssociation", data.data.myshopify_domain);
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  const handleGetShopInfo = async () => {
    // setIsLoading(true);

    await fetch("api/shop/currency", { method: "GET" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Assuming the response is in JSON format
      })
      .then((data) => {
        // console.log("checker shop info:", data); // This will log the fetched products

        setCurrencyCode(
          data.currencyFormats.moneyFormat.split("{{amount}}")[0]
        );
      })
      .catch((error) => {
        // setIsLoading(false);
        console.log("error fetching shop info:", error);
      });
  };
  useEffect(() => {
    fetchUserShop();
    handleGetShopInfo()
  }, []);
  // console.log("payloadd", employeeData);
  return (
    <div style={{
      margin: '20px',
      marginLeft: "40px",
      marginRight: "40px",
    }}>
      <div style={{
        display: 'flex', gap: '5px'
      }}>
        <Button onClick={() => window.history.back()} plain={true} monochrome={true} removeUnderline icon={ArrowLeftIcon}></Button>
        <Text fontWeight="bold" variant="headingLg">Allocate Discount</Text>
      </div>
      <div
        style={{
          marginTop: '20px',
          display: "flex",
          flexWrap: 'wrap',
          gap: '25px',
        }}
      >
        <div
          style={{
            width: "72%",
            height: "40%",
          }}
        >
          {dismissBanner && <Banner onDismiss={() => setDismissBanner(false)}>
            <p>As a valued team member, enjoy special discounts on a wide range of products and services. Shop smart and save big with deals tailored just for you. Your dedication deserves recognition—this is our way of saying thank you!</p>
          </Banner>}

          <div style={{ marginBottom: 10 }} />
          <LegacyCard >
            <Page
              fullWidth
            >
              <FormLayout >
                <Text fontWeight="medium" variant="bodyLg">Discount</Text>

                <FormLayout.Group>
                  <TextField
                    type="email"
                    label="Enter Email"
                    value={employeeData.email || ""}
                    onChange={(value) => handleSetEmployee("email", value)}
                    autoComplete="off"
                    error={
                      employeeEmailError
                        ? "Email required."
                        : emailValidationMesage !== null
                          ? emailValidationMesage
                          : ""
                    }
                  />
                  <Select
                    label="Select Discount Type"
                    options={options}
                    onChange={handleSelectChange}
                    value={employeeData.discountType || selected}
                  />
                </FormLayout.Group>
                <FormLayout.Group >
                  <TextField
                    suffix={employeeData.discountType === "percentage" ? "%" : ""}
                    prefix={employeeData.discountType !== "percentage" ? `${currencyCode}` : ""}
                    type="number"
                    label="Enter discount value"
                    value={employeeData.discountValue}
                    onChange={(value) => handleSetEmployee("discountValue", value)}
                    autoComplete="off"
                    error={
                      employeeDiscountValueError
                        ? "discount value required."

                        : ""
                    }
                  />
                  <TextField
                    prefix={`${currencyCode ?? ""}`}
                    type="number"
                    label="User Total Cap"
                    value={employeeData.userCapTotal}
                    onChange={(value) => handleSetEmployee("userCapTotal", value)}
                    autoComplete="off"
                    error={employeeCapError ? "Cap required." : ""}
                    helpText={maxCap ? "Cap should not exceed 100,000" : ""}
                  />
                </FormLayout.Group>
                <Text alignment="center" fontWeight="medium" variant="bodyMd">Random Discount Code generated & applied at checkout's subtotal, over a tap of button (Add Employee Discount)</Text>
              </FormLayout>

            </Page>
          </LegacyCard>
        </div>
        <div
          style={{
            width: "25%",
            height: "40%",
            // flex: 1,
            padding: 10,
            borderColor: "#FFFFFF",
            borderRadius: "10px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #FFFFFF",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Adds shadow effect
            // position: "fixed",
            // alignContent: "flex-end",
            // alignSelf: "self-end", // Ensure it stays at the top
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: "500", color: "black" }}>
            Summary
          </span>

          <div
            style={{
              marginTop: 10,
              marginBottom: 20,
              fontSize: "12px",
              color: "gray",
              fontWeight: "500",
            }}
          >
            Random Discount Code generated & applied at checkout's subtotal, over a tap of button (Add Employee Discount)
          </div>
          <span style={{ fontSize: "14px", fontWeight: "500", color: "black" }}>
            Type and method
          </span>
          <div style={defaultListStyle}>
            <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
              {items.map((item, index) => (
                <li
                  key={index}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <span style={bulletStyle}>•</span>
                  {item}
                </li>
              ))}
            </ul>
            {/* <button onClick={() => addItem("New Point")}>Add Point</button> */}
          </div>
          <span style={{ fontSize: "14px", fontWeight: "500", color: "black" }}>
            Details
          </span>
          <div style={defaultListStyle}>
            <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
              {items_two.map((item, index) => (
                <li
                  key={index}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <span style={bulletStyle}>•</span>
                  {item}
                </li>
              ))}
            </ul>
            {/* <button onClick={() => addItem_two("New Point")}>Add Point</button> */}
          </div>

        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          marginTop: '30px',
        }}
      >
        {!loading && (
          <button
            // loading={modalLoader}
            onClick={() => window.history.back()}
            primary
            style={{
              // borderColor: "transparent",
              backgroundColor: "white",
              color: "black",
              borderRadius: "8px", // Adjust the radius as needed
              height: "26px", // Adjust the height as needed
              padding: "0 14px", // Adjust padding as needed
              fontWeight: "bold", // Optional, for text styling
              fontSize: "12px",
              borderColor: "#FFFFFF",
              cursor: "default", // Default cursor
              border: "1px solid #FFFFFF",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Adds shadow effect          }}
            }}
          >
            Discard
          </button>
        )}
        <button
          // loading={modalLoader}
          onClick={() =>
            handlePostEmployee()
          }
          primary
          style={{
            backgroundColor: "black",
            color: "white",
            borderRadius: "8px", // Adjust the radius as needed
            height: "26px", // Adjust the height as needed
            padding: "0 14px", // Adjust padding as needed
            fontWeight: "bold", // Optional, for text styling
            fontSize: "12px",
            cursor: "default", // Default cursor
          }}
        >
          {loading ? (
            <img
              src={spinner}
              alt="Loading..."
              style={{ width: "20px", height: "20px" }}
            />
          ) : (
            "Create Discount"
          )}
        </button>
      </div>
    </div>
  );
}
