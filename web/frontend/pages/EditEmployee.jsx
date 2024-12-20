import {
  AlphaCard,
  Card,
  FormLayout,
  LegacyCard,
  Page,
  PageActions,
  Select,
  TextField,
} from "@shopify/polaris";
import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function EditEmployee() {
  const payload = useLocation();
  console.log("oke.", payload);
  const [employeeData, setEmployeeData] = useState({});
  const [employeeEmailError, setEmployeeEmailError] = useState(false);
  const [employeeDiscountValueError, setEmployeeDiscountValueError] = useState(false);
  const [employeeCapError, setEmployeeCapError] = useState(false);
  const [loading, setloading] = useState(false);
  const [maxCap, setMaxCap] = useState(false);
  const [maxGrade, setMaxGrade] = useState(false);
  const [emailValidationMesage, setEmailValidationMesage] = useState(null);
  const [selected, setSelected] = useState('percentage');
  const options = [
    { label: 'Percentage', value: 'percentage' },
    { label: 'Fixed Amount', value: 'fixed_amount' },
  ];
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
      setEmployeeDiscountValueError(false);
    }
    if (employeeData.userCapTotal) {
      setEmployeeCapError(false);
    }
  };

  const handleFetchEmployee = async (id) => {
    try {
      console.log("iid", id);
      const apiUrl = `https://multi-store-employee-discount-app.vercel.app/api/employee/${id}`;

      // const payload = { employeeEmail: userEmail };

      const response = await fetch(apiUrl, {
        headers: {
          "api-key": `${process.env.EMPLOYEE_APP_BACKEND_KEY}`,
          "Content-Type": "application/json",
        },
      });

      // Check if the response is ok (status in the range 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json(); // Parse JSON from the response
      console.log("is employee", data);
      setEmployeeData(data.data);
      //   setEmployees(data.data);
      //   setFilteredEmployees(data.data);
      // setDiscountCode(data.data.discount_code.code);
      // if (!data.status) {
      //   setDiscountMessage(data.message);
      // } else {
      //   await handleAddDiscount(data.data.discount_code.code);
      // }
    } catch (error) {
      console.error("Error order discount create", error);
    }
  };

  useEffect(() => {
    handleFetchEmployee(payload.state);
  }, [payload]);

  const handleEditEmployee = async () => {
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
      const apiUrl = `https://multi-store-employee-discount-app.vercel.app/api/employee/${payload.state}`;
      const response = await fetch(apiUrl, {
        method: "PATCH",
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

  console.log("payload", employeeData);
  return (
    <div
      style={{
        width: "50%",
        marginLeft: 30,
        marginTop: 30,
      }}
    >
      <LegacyCard>
        <Page
          fullWidth
          backAction={{
            content: "Settings",
            onAction: () => window.history.back(), // Or change to the correct URL
          }}
          title="Edit an employee"
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

            <Select

              label="Select Discount Type"
              options={options}
              onChange={handleSelectChange}
              value={employeeData.discountType || selected}
            />

            <TextField
              suffix={employeeData.discountType === "percentage" ? "%" : "/="}
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
              type="number"
              label="User Total Cap"
              value={employeeData.userCapTotal}
              onChange={(value) => handleSetEmployee("userCapTotal", value)}
              autoComplete="off"
              error={employeeCapError ? "Cap required." : ""}
            />
            {/* </FormLayout.Group> */}
          </FormLayout>
          <PageActions
            primaryAction={{
              loading: loading,
              content: "Save employee",
              onAction: () => handleEditEmployee(),
            }}
          />
        </Page>
      </LegacyCard>
    </div>
  );
}
