import {
  AlphaCard,
  Banner,
  Card,
  FormLayout,
  LegacyCard,
  Page,
  PageActions,
  Select,
  TextField,
} from "@shopify/polaris";
import React, { useCallback, useState } from "react";

export default function AddEmployee() {
  const [employeeData, setEmployeeData] = useState({});
  const [employeeEmailError, setEmployeeEmailError] = useState(false);
  const [employeeGradeError, setEmployeeGradeError] = useState(false);
  const [employeeCapError, setEmployeeCapError] = useState(false);
  const [loading, setloading] = useState(false);
  const [maxCap, setMaxCap] = useState(false);
  const [maxGrade, setMaxGrade] = useState(false);
  const [emailValidationMesage, setEmailValidationMesage] = useState(null);
  const [selected, setSelected] = useState("1");
  const [bannerVisible, setBannerVisible] = useState(true);
  const defaultListStyle = {
    marginTop: "10px",
    // marginBottom: "20px",
    fontSize: "12px",
    color: "gray",
    fontWeight: "500",
    marginLeft: "2px",
  };
  const [items_two, setItems_two] = useState([
    "Order Discount - amount off order",
    "Automatically applies when clicked on apply employee discount at checkout",
    "Upon clicking on prior button, it first create discount then applies on employees checkout items.",
  ]);
  const [items, setItems] = useState([
    "For Online Store",
    "No minimum purchase requirement",
    "Can’t combine with other discounts",
    "Limit of 1 use",
  ]);
  const addItem_two = (newItem) => {
    setItems_two([...items, newItem]);
  };
  const addItem = (newItem) => {
    setItems_two([...items, newItem]);
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
  const handleSelectChange = useCallback((value) => {
    setBannerVisible(true);
    setSelected(value);
    handleSetEmployee("grade", value);
  }, []);

  const options = [
    { label: "OG1 & OG2", value: "1" },
    { label: "M1", value: "2" },
    { label: "M2", value: "3" },
    { label: "M3 & M4", value: "4" },
    { label: "M5 & M6", value: "5" },
    { label: "M7 & M8", value: "6" },
  ];
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
    if (key === "grade" && parseInt(value) < 1) return;
    if (key === "grade" && parseInt(value) > 22) {
      setMaxCap(true);
      return;
    } else {
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
      setEmployeeGradeError(false);
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
    // if (!employeeData.email.includes("@cambridge")) {
    //   return setEmailValidationMesage("Invalid email");
    // } else {
    //   setEmailValidationMesage(null);
    // }

    if (!employeeData.email) {
      setEmployeeEmailError(true);
      return;
    } else {
      setEmployeeEmailError(false);
    }
    // if (!employeeData.grade) {
    //   setEmployeeGradeError(true);
    //   return;
    // } else {
    //   setEmployeeGradeError(false);
    // }
    // if (!employeeData.userCapTotal) {
    //   setEmployeeCapError(true);
    //   return;
    // } else {
    //   setEmployeeCapError(false);
    // }

    if (!employeeData.grade) {
      employeeData.grade = "1";
    }
    try {
      setloading(true);
      const apiUrl = `https://employee-discount-backend.vercel.app/api/employee`;
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
  function getGradeToDiscount(grade) {
    let totalCap;

    switch (grade) {
      case 1:
        totalCap = 5000; // 5% totalCap for grade 10
        break;
      case 2:
        totalCap = 10000;
        break;
      case 3:
        totalCap = 20000;
        break;
      case 4:
        totalCap = 30000;
        break;
      case 5:
        totalCap = 40000;
        break;
      case 6:
        totalCap = 50000;
        break;
      default:
        totalCap = 0; // 0% totalCap for invalid or unlisted grades
        break;
    }

    return totalCap;
  }
  console.log("payload", employeeData);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        gap: "20px",
        paddingLeft: 20,
        paddingRight: 20,
        marginTop: 10,
      }}
    >
      {/* Employee add form */}
      <div style={{ width: "70%" }}>
        <LegacyCard>
          <Page
            fullWidth
            backAction={{
              content: "Settings",
              onAction: () => window.history.back(), // Or change to the correct URL
            }}
            title="Create an employee"
          >
            <FormLayout>
              {/* <FormLayout.Group> */}
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

              {/* <TextField
              type="number"
              label="Enter Grade"
              value={employeeData.grade}
              onChange={(value) => handleSetEmployee("grade", value)}
              autoComplete="off"
              error={
                employeeGradeError
                  ? "Grade required."
                  : maxGrade
                  ? "This is the maximum grade you can assign to employee."
                  : ""
              }
            /> */}

              <Select
                label="Select Job Grade"
                options={options}
                onChange={handleSelectChange}
                value={selected}
                // error={
                //   employeeGradeError
                // Grade required

                // }
              />
              {bannerVisible && (
                <Banner
                  title="Allotable Discount Cap"
                  onDismiss={() => setBannerVisible(false)}
                >
                  <p>{getGradeToDiscount(parseInt(selected))} /=</p>
                </Banner>
              )}

              {/* <TextField
              type="number"
              label="User Total Cap"
              value={employeeData.userCapTotal}
              onChange={(value) => handleSetEmployee("userCapTotal", value)}
              autoComplete="off"
              error={employeeCapError ? "Cap required." : ""}
            /> */}
              {/* </FormLayout.Group> */}
            </FormLayout>
            <PageActions
              primaryAction={{
                loading: loading,
                content: "Save employee",
                onAction: () => handlePostEmployee(),
              }}
            />
          </Page>
        </LegacyCard>
      </div>

      {/* Details Card */}
      <div
        style={{
          width: "30%",
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
          35% Employee Discount is given from thier available cap.
          {/* {newDiscountCode ? newDiscountCode : "No discount code yet"} */}
        </div>
        <span style={{ fontSize: "14px", fontWeight: "500", color: "black" }}>
          Type and method
        </span>
        <div style={defaultListStyle}>
          <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
            {items_two.map((item, index) => (
              <li
                key={index}
                style={{ display: "flex", alignItems: "flex-start" }}
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
            {items.map((item, index) => (
              <li
                key={index}
                style={{ display: "flex", alignItems: "flex-start" }}
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
  );
}
