import React, { createContext, useEffect, useMemo, useState } from "react";

const TenantContext = createContext(null);

const TenantProvider = (props) => {
  const { children, onError } = props;

  if (!props.applicationId) {
    throw new Error("TenantProvider: application prop is required");
  }
  if (!process.env.REACT_APP_TENANT_API) {
    throw new Error(
      "TenantProvider: REACT_APP_TENANT_API environment variable is required"
    );
  }

  const [tenant, ] = useState(props.applicationId);
  const configValue = props.config;
  const [params, setParams] = useState(props.params || []);
  const [application, setApplication] = useState();

  useEffect(() => {
    if (!tenant) {
      return;
    }
    fetch(process.env.REACT_APP_TENANT_API + "api.php/tenant", {
      headers: { "Content-Type": "application/json", APP_ID: tenant },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setApplication(data[0]);
        } else {
          setApplication(data);
        }
      })
      .catch((err) => {
        if (onError) {
          onError("Tenant: Unable to fetch Tenant details", err);
        }
      });
    fetch(process.env.REACT_APP_TENANT_API + "getsettings.php", {
      headers: { "Content-Type": "application/json", APP_ID: tenant },
    })
      .then((res) => res.json())
      .then((data) => {
        setParams(data);
      })
      .catch((err) => {
        if (onError) {
          onError("Tenant: Unable to fetch Tenant Params",err);
        }
      });
  }, [tenant]);

  const values = useMemo(
    () => ({ tenant, application, config: configValue, params }),
    [tenant, configValue, params]
  );

  return (
    <TenantContext.Provider value={values}>{children}</TenantContext.Provider>
  );
};

export { TenantContext, TenantProvider };
