import {
  TextField,
  IndexTable,
  LegacyCard,
  IndexFilters,
  useSetIndexFiltersMode,
  useIndexResourceState,
  Text,
  ChoiceList,
  RangeSlider,
  Badge,
  useBreakpoints,
  Page,
  Button,
  LegacyStack,
  Icon,
  Layout,
  SkeletonBodyText,
  SkeletonPage,
  SkeletonDisplayText,
  SkeletonThumbnail,
  TextContainer,
  SkeletonTabs,
  Link,
  IndexFiltersMode,
} from "@shopify/polaris";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DeleteIcon,
  DiscountFilledIcon,
  DiscountIcon,
  PersonFilledIcon,
  PlusIcon,
} from "@shopify/polaris-icons";

import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { useTranslation, Trans } from "react-i18next";

import { trophyImage } from "../assets";

import { ProductsCard } from "../components";
import { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get current path
  const path = location.pathname;
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [isSelected, setIsSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFetchedEmployees, setIsFetchedEmployees] = useState(false);
  const [employeeAssociation, setEmployeeAssociation] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState();
  const [page, setPage] = useState(1);
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const [itemStrings, setItemStrings] = useState(["Sort by"]);
  const [sortSelected, setSortSelected] = useState(['cap asc']);
  const sortOptions = [
    { label: 'Avalalble Cap', value: 'cap asc', directionLabel: 'Ascending' },
    { label: 'Avalalble Cap', value: 'cap desc', directionLabel: 'Descending' },
    { label: 'Email', value: 'email asc', directionLabel: 'A-Z' },
    { label: 'Email', value: 'email desc', directionLabel: 'Z-A' },
  ];
  var { mode, setMode } = useSetIndexFiltersMode(IndexFiltersMode.Filtering);
  useEffect(() => {
    console.log('sort selected', sortSelected);


    switch (sortSelected[0]) {
      case "cap asc":
        sortBy("ascending")
        break;
      case "cap desc":
        sortBy("descending")
        break;
      case "email asc":
        sortBy("ascending", true)
        break;
      case "email desc":
        sortBy("descending", true)
        break;
      default:
        break;
    }
    // // if(sortSelected[0] === "cap asc"){
    // //   sortBy("ascending")
    // // }
    // // else if(sortSelected[0] === "cap desc"){
    // //   sortBy("descending")
    // // }
    // else if ()
  }, [sortSelected]);
  // Navigate when "Add Employee" tab is clicked
  const handleTabAction = (index) => {
    if (index === 1) {
      navigate("/AddEmployee");
    }
  };

  const handleFetchEmployees = async (page = 1, limit = 50) => {
    try {
      // setIsFetchedEmployees(true);
      const apiUrl = `https://multi-store-employee-discount-app.vercel.app/api/employee?page=${page}&limit=${limit}&employeeAssociation=${employeeAssociation}`;
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
      // console.log("fetching employees", data);
      setEmployees(data.data);
      setFilteredEmployees(data.data);
      setIsFetchedEmployees(false);

      // setDiscountCode(data.data.discount_code.code);
      // if (!data.status) {
      //   setDiscountMessage(data.message);
      // } else {
      //   await handleAddDiscount(data.data.discount_code.code);
      // }
    } catch (error) {
      setIsFetchedEmployees(false);

      console.error("Error order discount create", error);
    }
  };
  useEffect(() => {
    if (!employeeAssociation) return;
    handleFetchEmployees();
  }, [employeeAssociation]);

  useEffect(() => {
    if (isSelected && itemStrings.length <= 2) {
      setItemStrings((prevStrings) => [...prevStrings, "Other Options"]);
    } else {
      setItemStrings(["Sort by"]);
    }
  }, [isSelected]);

  const deleteEmployee = async (index) => {
    if (!selectedEmployeeId) return;
    console.log("employee id", selectedEmployeeId);
    try {
      setLoading(true);
      const apiUrl = `https://multi-store-employee-discount-app.vercel.app/api/employee/${selectedEmployeeId}`;
      const response = await fetch(apiUrl, {
        method: "DELETE",
        headers: {
          "api-key": `${process.env.EMPLOYEE_APP_BACKEND_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json(); // Parse JSON from the response
      console.log("is employee delete", data);
      if (data.status) {
        handleFetchEmployees();
        setIsSelected(false);
        //hanlde success condition
      } else {
        //hanlde error condition
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error order discount create", error);
    }
  };

  const editEmployee = async (name) => {
    console.log("taara");
    setItemStrings([...itemStrings, name]);
    setSelected(itemStrings.length);
    return true;
  };
  const handleTabChange = (selectedIndex) => {
    setSelected(selectedIndex);
  };
  // Sort in Ascending order by email
  const sortBy = (method, By = false) => {
    const sorted = [...filteredEmployees].sort((a, b) => {
      if (By) {
        // Sort numerically by userCapRemain
        return method === "ascending"
          ? parseInt(b.userCapRemain) - parseInt(a.userCapRemain)
          : parseInt(a.userCapRemain) - parseInt(b.userCapRemain);
      } else {
        // Sort alphabetically by email
        return method === "ascending"
          ? a.email.localeCompare(b.email)
          : b.email.localeCompare(a.email);
      }
    });
    setFilteredEmployees(sorted);
  };

  const tabs = itemStrings.map((item, index) => ({
    content: item,
    index,
    onAction: () => handleTabAction(index), // Navigation handler
    id: `${item}-${index}`,
    // icon: index === 1 ? <DiscountIcon /> : null, // Pass the icon here
    actions:
      index === 0
        ? [
          {
            type: "",
            content: "Asscending order",
            helpText: "(By email)",
            onAction: () => sortBy("ascending"),
            onPrimaryAction: (value) => {
              handleFetchEmployees();
              return true;
            },
          },
          {
            type: "",
            content: "Decending order",
            helpText: "(By email)",
            onAction: () => sortBy("descending"),
            onPrimaryAction: () => {
              console.log("abc");
              setEmployees();
              return true;
            },
          },
          {
            type: "",
            content: "Asscending order",
            helpText: "(By available cap)",
            // accessibilityLabel: "ajjaja",
            onAction: () => sortBy("ascending", true),
            onPrimaryAction: (value) => {
              handleFetchEmployees();
              return true;
            },
          },
          {
            type: "",
            content: "Decending order",
            helpText: "(By available cap)",
            onAction: () => sortBy("descending", true),
            onPrimaryAction: () => {
              console.log("abc");
              setEmployees();
              return true;
            },
          },
        ] // No actions for the first tab
        : index > 0 && [
          {
            type: "edit",
            content: "Edit employee",
            onAction: () => {
              navigate("/EditEmployee", { state: selectedEmployeeId });
            },
            // onPrimaryAction: async (value) => {
            //   await editEmployee(value);
            //   return true;
            // },
          },
          {
            type: "delete",
            content: "Delete employee",
            onAction: () => {
              console.log("tasdeeq");
            },
            onPrimaryAction: async () => {
              deleteEmployee(index);
              return true;
            },
          },
        ],
  }));

  const [selected, setSelected] = useState(0);
  const onCreateNewView = async (value) => {
    await sleep(500);
    setItemStrings([...itemStrings, value]);
    setSelected(itemStrings.length);
  };

  // const { mode, setMode } = useSetIndexFiltersMode();
  const onHandleCancel = () => { };

  const onHandleSave = async () => {
    await sleep(1);
    return true;
  };

  const primaryAction =
    selected === 0
      ? {

      }
      : {
        type: "save",
        onAction: onHandleSave,
        disabled: false,
        loading: false,
      };
  const [accountStatus, setAccountStatus] = useState(undefined);
  const [moneySpent, setMoneySpent] = useState(undefined);
  const [taggedWith, setTaggedWith] = useState("");
  const [queryValue, setQueryValue] = useState("");
  const [selectedRow, setSelectedRow] = useState(null); // To track the selected row
  const [currencyCode, setCurrencyCode] = useState("");
  const resourceName = {
    singular: "order",
    plural: "employees",
  };
  const handleMoneySpentChange = useCallback(
    (value) => setMoneySpent(value),
    [],
  );
  const handleAccountStatusChange = useCallback(
    (value) => setAccountStatus(value),
    [],
  );
  const handleTaggedWithChange = useCallback(
    (value) => setTaggedWith(value),
    [],
  );
  const filters = [
    {
      key: 'accountStatus',
      label: 'Account status',
      filter: (
        <ChoiceList
          title="Account status"
          titleHidden
          choices={[
            { label: 'Enabled', value: 'enabled' },
            { label: 'Not invited', value: 'not invited' },
            { label: 'Invited', value: 'invited' },
            { label: 'Declined', value: 'declined' },
          ]}
          selected={accountStatus || []}
          onChange={handleAccountStatusChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: 'taggedWith',
      label: 'Tagged with',
      filter: (
        <TextField
          label="Tagged with"
          value={taggedWith}
          onChange={handleTaggedWithChange}
          autoComplete="off"
          labelHidden
        />
      ),
      shortcut: true,
    },
    {
      key: 'moneySpent',
      label: 'Money spent',
      filter: (
        <RangeSlider
          label="Money spent is between"
          labelHidden
          value={moneySpent || [0, 500]}
          prefix="$"
          output
          min={0}
          max={2000}
          step={1}
          onChange={handleMoneySpentChange}
        />
      ),
    },
  ];

  const appliedFilters =
    taggedWith && !isEmpty(taggedWith)
      ? [
        {
          key: 'taggedWith',
          label: disambiguateLabel('taggedWith', taggedWith),
          onRemove: handleTaggedWithRemove,
        },
      ]
      : [];
  const {
    selectedResources,

    allResourcesSelected,
    handleSelectionChange,
    resourceIDResolver,
  } = useIndexResourceState(filteredEmployees);

  const handleNextPage = () => {
    if (employees.length === 0) {
      setPage(1);
      handleFetchEmployees(1);
      return;
    }
    setPage((prev) => ++prev);
    handleFetchEmployees(page);
  };

  const handlePreviousPage = () => {
    if (employees.length === 0) {
      setPage(1);
      handleFetchEmployees(1);
      return;
    }
    if (page > 1) {
      setPage((prev) => --prev);
    }
    handleFetchEmployees(page);
  };

  // console.log("state check pagniation page", page);

  const handleFiltersQueryChange = (value) => {
    setQueryValue(value);
    // const filter = filteredEmployees.filter((data) => data.email === value);
    // console.log(filter);
    // setFilteredEmployees(filter);

    if (value === "") {
      // If input is cleared, reset the filtered discounts to the full list
      setFilteredEmployees(employees);
    } else {
      // Filter the full list of discounts based on the current input value
      const filtered = employees.filter((data) =>
        data.email.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  };

  const handleAccountStatusRemove = useCallback(
    () => setAccountStatus(undefined),
    []
  );

  const handleMoneySpentRemove = useCallback(
    () => setMoneySpent(undefined),
    []
  );

  const handleTaggedWithRemove = useCallback(() => setTaggedWith(""), []);

  const handleQueryValueRemove = useCallback(() => setQueryValue(""), []);

  const handleFiltersClearAll = useCallback(() => {
    handleAccountStatusRemove();
    handleMoneySpentRemove();
    handleTaggedWithRemove();
    handleQueryValueRemove();
  }, [
    handleAccountStatusRemove,
    handleMoneySpentRemove,
    handleQueryValueRemove,
    handleTaggedWithRemove,
  ]);

  if (accountStatus && !isEmpty(accountStatus)) {
    const key = "accountStatus";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, accountStatus),
      onRemove: handleAccountStatusRemove,
    });
  }
  if (moneySpent) {
    const key = "moneySpent";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, moneySpent),
      onRemove: handleMoneySpentRemove,
    });
  }
  if (!isEmpty(taggedWith)) {
    const key = "taggedWith";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, taggedWith),
      onRemove: handleTaggedWithRemove,
    });
  }

  function formatDate(dateString) {
    // Create a new Date object from the input string
    const date = new Date(dateString);

    // Define options for toLocaleDateString to get the desired format
    const options = {
      day: "numeric", // Get day as numeric value
      month: "short", // Get abbreviated month (e.g., Oct)
      year: "numeric", // Get full year (e.g., 2023)
    };

    // Convert the date to the desired format
    return date.toLocaleDateString("en-GB", options);
  }

  // Custom handler to allow only one selection at a time
  // Custom handler to select only the current row
  const handleSingleRowSelection = (id) => {
    if (selectedRow === id) {
      // If the same row is clicked again, deselect it
      setSelectedRow(null);
      handleSelectionChange([], false); // Clear all selections
    } else {
      // If a new row is selected, deselect previous and select the new one
      setSelectedRow(id);
      handleSelectionChange([id], false); // Select only this row
    }
  };
  const rowMarkup = filteredEmployees.map(
    (
      {
        _id,
        email,
        discountValue,
        userCapTotal,
        userCapRemain,
        allocatedMonth,
        discountType,
      },
      index
    ) => (
      <IndexTable.Row
        id={_id}
        key={_id}
        selected={selectedResources.includes(_id)}
        position={index}
      // onClick={() => handleSingleRowSelection(_id)} // Use custom handler
      >
        {/* <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {order}
          </Text>
        </IndexTable.Cell> */}
        <Link monochrome
          removeUnderline onClick={() => navigate("/EditEmployee", { state: selectedEmployeeId })}><IndexTable.Cell>{email}</IndexTable.Cell></Link>
        <IndexTable.Cell>
          {discountValue}
          {discountType.toLowerCase() === "percentage" ? " %" : " /="}
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="span" numeric>
            {currencyCode + " "}
            {userCapTotal}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          {currencyCode + " "}
          {userCapRemain}
        </IndexTable.Cell>
        <IndexTable.Cell>{formatDate(allocatedMonth)}</IndexTable.Cell>
      </IndexTable.Row>
    )
  );
  const fetchUserShop = async () => {
    try {
      setIsFetchedEmployees(true);
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
      // console.log("dtae", data.data.myshopify_domain);

      if (!employeeAssociation) {
        setEmployeeAssociation(data.data.myshopify_domain);
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  const saveCredentials = async () => {
    try {
      const fullUrl = window.location.href;
      // console.log('sddjjs', path);
      const apiUrl = `/api/credentials`;

      // const payload = { employeeEmail: userEmail };

      const response = await fetch(apiUrl, {
        headers: {
          // "api-key": `${process.env.EMPLOYEE_APP_BACKEND_KEY}`,
          "Content-Type": "application/json",
        },
      });

      // Check if the response is ok (status in the range 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response}`);
      }

      const data = await response.json(); // Parse JSON from the response
      // console.log("check save credentials", data);

      // if (!employeeAssociation) {
      //   setEmployeeAssociation(data.data.myshopify_domain);
      // }
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
    handleGetShopInfo();
    saveCredentials();
  }, []);
  return (
    <Page fullWidth>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Text
          element="h2"
          variant="headingXl"
          fontWeight="semibold"
          alignment="center"
        >
          Manage Cambridge Employees
        </Text>
        <div
          style={{ alignSelf: "flex-end", display: "flex", marginBottom: 10 }}
        >
          <Button
            icon={PersonFilledIcon}
            onClick={() => navigate("/AddEmployee")}
          >
            Add Employee
          </Button>
        </div>
      </div>

      {isFetchedEmployees ? (
        <>
          <LegacyCard sectioned>
            <div style={{ display: "flex", justifyContent: "space-between", alignContent: 'center', marginBottom: 5 }}>
              <SkeletonThumbnail size="small" />
              <SkeletonThumbnail size="small" />
            </div>
            <SkeletonTabs fitted={false} count={5} />
            <div style={{ marginBottom: 10 }} />
            <SkeletonBodyText lines={7} />
          </LegacyCard>
        </>
      ) : (
        <>
          <LegacyCard>
            <IndexFilters
              sortOptions={sortOptions}
              sortSelected={sortSelected}
              queryValue={queryValue}
              queryPlaceholder="Search employees"
              onQueryChange={handleFiltersQueryChange}
              onQueryClear={() => setQueryValue("")}
              onSort={(val) => {

                setSortSelected(val);
              }}
              primaryAction={primaryAction}
              cancelAction={{
                onAction: onHandleCancel,
                disabled: false,
                loading: false,
              }}
              tabs={tabs}
              selected={selected}
              onSelect={setSelected}
              canCreateNewView={false}
              // onCreateNewView={onCreateNewView}
              filters={filters}
              appliedFilters={appliedFilters}
              onClearAll={handleFiltersClearAll}
              mode={mode}
              setMode={setMode}
            />
            <IndexTable
              resourceName={resourceName}
              itemCount={filteredEmployees.length}
              selectedItemsCount={
                allResourcesSelected ? "All" : selectedResources.length
              }
              // bulkActions={bulkActions}
              // promotedBulkActions={promotedBulkActions}
              onSelectionChange={(e, b, c) => {
                handleSelectionChange(e, b, c);
                setSelectedEmployeeId(c);
                setIsSelected((prev) => !prev);
              }}
              headings={[
                // { title: "Employee Id" },
                { title: "Email" },
                { title: "Designated Value" },
                { title: `Total Cap` },
                { title: `Available Cap` },
                { title: "Cap Allocation Month" },
              ]}
            >
              {rowMarkup}
            </IndexTable>
          </LegacyCard>

          {employees.length > 49 && (
            <div
              style={{
                marginTop: 10,
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 2,
              }}
            >
              <button
                style={{
                  backgroundColor: "#d4d4d4",
                  borderColor: "#d4d4d4",
                  //#C0C0C0
                  borderWidth: 0,
                  borderTopLeftRadius: 5,
                  borderBottomLeftRadius: 5,
                  cursor: "pointer", // Set cursor to pointer
                  transition: "background-color 0.3s", // Smooth transition for background color
                  paddingTop: 5,
                  paddingBottom: 5,
                }}
                onClick={handlePreviousPage}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#c0c0c0"; // Change background on hover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#d4d4d4"; // Revert to original color on hover out
                }}
              >
                <Icon source={ChevronLeftIcon} />
              </button>

              <button
                style={{
                  // width: "20%",
                  // height: "40%",
                  paddingTop: 5,
                  paddingBottom: 5,
                  backgroundColor: "#d4d4d4",
                  borderColor: "#d4d4d4",
                  borderWidth: 0,
                  borderTopRightRadius: 5,
                  borderBottomRightRadius: 5,
                  cursor: "pointer", // Set cursor to pointer
                  transition: "background-color 0.3s", // Smooth transition for background color
                }}
                onClick={handleNextPage}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#c0c0c0"; // Change background on hover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#d4d4d4"; // Revert to original color on hover out
                }}
              >
                <Icon source={ChevronRightIcon} />
              </button>
            </div>
          )}
        </>
      )}
    </Page>
  );
  function disambiguateLabel(key) {
    switch (key) {
      case "moneySpent":
        return `Money spent is between $${value[0]} and $${value[1]}`;
      case "taggedWith":
        return `Tagged with ${value}`;
      case "accountStatus":
        return value.map((val) => `Customer ${val}`).join(", ");
      default:
        return value;
    }
  }

  function isEmpty(value) {
    if (Array.isArray(value)) {
      return value.length === 0;
    } else {
      return value === "" || value == null;
    }
  }
}
