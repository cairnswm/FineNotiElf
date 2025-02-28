import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useJwt } from "react-jwt";
import { useTenant } from '../hooks/useTenant';
import useDeviceInfo from '../hooks/useDeviceInfo';
import { combineUrlAndPath } from '../utils/combineUrlAndPath';
import useEventing from '../hooks/useEventing';

const AuthenticationContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthenticationContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthenticationProvider');
  }
  return context;
};

const AuthenticationProvider = (props) => {
  const { children, googleClientId, onError } = props;
  const [token, settoken] = useState();
  const [googleAccessToken, setgoogleAccessToken] = useState();
  const [user, setUser] = useState();
  const { decodedToken } = useJwt(googleAccessToken || "");
  const [properties, setProperties] = useState([]);
  const [roles, setRoles] = useState([]);

  const { tenant } = useTenant();
  const { deviceId } = useDeviceInfo();

  if (!process.env.REACT_APP_AUTH_API) {
    throw new Error(
      "AuthProvider: REACT_APP_AUTH_API environment variable is required"
    );
  }

  useEffect(() => {
    if (token) {
      localStorage.setItem("cg." + tenant + ".auth", token);
    }
  }, [token, tenant]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }
    fetchProperties();
  }, [user]);

  const validateToken = (token) => {
    const body = { token: token };
    fetch(
      combineUrlAndPath(
        process.env.REACT_APP_AUTH_API,
        "validateToken.php?debug=true"
      ),
      {
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          APP_ID: tenant,
          deviceid: deviceId,
        },
        method: "POST",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (typeof data === "string") {
          data = JSON.parse(data);
        }
        if (data.errors) {
          console.error("VALIDATE TOKEN ERRORS", data.errors);
        }
        settoken(data.token);
        const userDetails = {
          email: data.email,
          lastname: data.lastname,
          firstname: data.firstname,
          id: data.id,
          name: data.firstname + " " + data.lastname,
          picture: data.avatar,
          permissions: data.permissions,
          mastertoken: data.mastertoken,
        };
        setUser(userDetails);
        if (window.location.hash.includes("auth")) {
          window.location.hash = "#";
        }
      })
      .catch((err) => {
        if (onError) {
          onError("Auth: Unable to Validate Token", err);
        }
      });
    settoken(token);
  };

  useEffect(() => {
    if (!process.env) {
      return;
    }
    const savedToken = localStorage.getItem("cg." + tenant + ".auth");
    if (savedToken && savedToken !== "undefined") {
      validateToken(savedToken);
    }
  }, [tenant]);

  const reloadPermissions = async () => {
    const savedToken = localStorage.getItem("cg." + tenant + ".auth");
    if (savedToken && savedToken !== "undefined") {
      validateToken(savedToken);
    }
  };

  useEventing("permissions", "reload", reloadPermissions);

  const getGoogleUser = useCallback(async () => {
    if (googleAccessToken && decodedToken) {
      const decodedToken2 = decodedToken;
      const body = {
        email: decodedToken2.email,
        firstname: decodedToken2.firstname,
        lastname: decodedToken2.lastname,
        googleid: decodedToken2.sub,
        avatar: decodedToken2.picture,
      };
      await fetch(
        combineUrlAndPath(process.env.REACT_APP_AUTH_API, `logingoogle.php`),
        {
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
            APP_ID: tenant,
            deviceid: deviceId,
          },
          method: "POST",
        }
      )
        .then((res) => res.json())
        .then((data) => {
          settoken(data.token);
          const userDetails = {
            email: data.email,
            lastname: data.lastname,
            firstname: data.firstname,
            id: data.id,
            name: data.firstname + " " + data.lastname,
            picture: data.avatar,
            permissions: data.permissions,
            mastertoken: data.mastertoken,
          };
          setUser(userDetails);
          window.location.hash = "#";
        })
        .catch((err) => {
          if (onError) {
            onError("Auth: Unable to complete Google Login", err);
          }
        });
    }
  }, [googleAccessToken, decodedToken, tenant, deviceId, onError]);

  useEffect(() => {
    if (googleAccessToken) {
      getGoogleUser();
    }
  }, [googleAccessToken, getGoogleUser]);

  const logout = () => {
    if (user && user.mastertoken) {
      validateToken(user.mastertoken);
    } else {
      setgoogleAccessToken(undefined);
      setUser(undefined);
      settoken(undefined);
      window.location.hash = "#";
      localStorage.removeItem("cg." + tenant + ".auth");
    }
  };

  const register = async (email, password, confirm) => {
    const body = {
      email: email,
      password: password,
      confirm: confirm,
    };
    return fetch(
      combineUrlAndPath(
        process.env.REACT_APP_AUTH_API,
        `registration.php?debug=true`
      ),
      {
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          APP_ID: tenant,
          deviceid: deviceId,
        },
        method: "POST",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (typeof data === "string") {
          data = JSON.parse(data);
        }
        settoken(data.token);
        const userDetails = {
          email: data.email,
          lastname: data.lastname,
          firstname: data.firstname,
          id: data.id,
          name: data.firstname + " " + data.lastname,
          picture: data.avatar,
          permissions: data.permissions,
        };
        setUser(userDetails);
        return data;
      })
      .catch((err) => {
        if (onError) {
          onError("Auth: Unable to complete Registration", err);
        }
      });
  };

  const login = (email, password) => {
    const body = {
      email: email,
      password: password,
    };

    return fetch(
      combineUrlAndPath(process.env.REACT_APP_AUTH_API, `login.php?debug=true`),
      {
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          APP_ID: tenant,
          deviceid: deviceId,
        },
        method: "POST",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.errors) {
          return data;
        }
        if (typeof data === "string") {
          data = JSON.parse(data);
        }
        settoken(data.token);
        const userDetails = {
          email: data.email,
          lastname: data.lastname,
          firstname: data.firstname,
          id: data.id,
          name: data.firstname + " " + data.lastname,
          picture: data.avatar,
          permissions: data.permissions,
        };
        setUser(userDetails);
        return data;
      })
      .catch((err) => {
        if (onError) {
          onError("Auth: Unable to complete Login", err);
        }
        return err;
      });
  };

  const requestMagicLink = (email) => {
    const body = {
      code: email,
    };
    return fetch(combineUrlAndPath(process.env.REACT_APP_AUTH_API, `magic.php`), {
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        APP_ID: tenant,
        deviceid: deviceId,
      },
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        if (typeof data === "string") {
          data = JSON.parse(data);
        }
        return data;
      })
      .catch((err) => {
        if (onError) {
          onError("Auth: Unable to complete Magic Link Request", err);
        }
      });
  };

  const loginWithMagicLink = (magiccode) => {
    const body = {
      code: magiccode,
    };

    return fetch(
      combineUrlAndPath(
        process.env.REACT_APP_AUTH_API,
        `loginwithmagiclink.php?debug=true`
      ),
      {
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          APP_ID: tenant,
          deviceid: deviceId,
        },
        method: "POST",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (typeof data === "string") {
          data = JSON.parse(data);
        }
        settoken(data.token);
        const userDetails = {
          email: data.email,
          lastname: data.lastname,
          firstname: data.firstname,
          id: data.id,
          name: data.firstname + " " + data.lastname,
          picture: data.avatar,
          permissions: data.permissions,
        };
        setUser(userDetails);
        window.location.hash = "home";
      })
      .catch((err) => {
        if (onError) {
          onError("Auth: Unable to complete Login", err);
        }
      });
  };

  const forgot = async (email) => {
    const body = {
      email: email,
    };
    return fetch(
      combineUrlAndPath(
        process.env.REACT_APP_AUTH_API,
        `forgotpassword.php?debug=true`
      ),
      {
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          APP_ID: tenant,
          deviceid: deviceId,
        },
        method: "POST",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (typeof data === "string") {
          data = JSON.parse(data);
        }
        return data;
      })
      .catch((err) => {
        if (onError) {
          onError("Auth: Unable to complete Forgot Password", err);
        }
      });
  };

  const changePassword = (id, old, password, password2) => {
    const body = {
      userid: id,
      oldpassword: old,
      password: password,
      password2: password2,
    };
    return fetch(
      combineUrlAndPath(
        process.env.REACT_APP_AUTH_API,
        `changepassword.php?debug=true`
      ),
      {
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          APP_ID: tenant,
          deviceid: deviceId,
        },
        method: "POST",
      }
    ).catch((err) => {
      if (onError) {
        onError("Auth: Unable to complete Change Password", err);
      }
    });
  };

  const impersonate = (id) => {
    fetch(
      combineUrlAndPath(
        process.env.REACT_APP_AUTH_API,
        `/impersonate.php?debug=true&id=${id}`
      ),
      {
        headers: {
          "Content-Type": "application/json",
          APP_ID: tenant,
          token: token,
          deviceid: deviceId,
        },
        method: "GET",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (typeof data === "string") {
          data = JSON.parse(data);
        }
        if (data.errors) {
          console.error("IMPERSONATE TOKEN ERRORS", data.errors);
        }
        settoken(data.token);
        const userDetails = {
          email: data.email,
          lastname: data.lastname,
          firstname: data.firstname,
          id: data.id,
          name: data.firstname + " " + data.lastname,
          picture: data.avatar,
          permissions: data.permissions,
          mastertoken: data.mastertoken,
        };
        setUser(userDetails);
        if (window.location.hash.includes("auth")) {
          window.location.hash = "#";
        }
      })
      .catch((err) => {
        if (onError) {
          onError("Auth: Unable to Validate Token", err);
        }
      });
    return true;
  };

  const fetchProperties = async () => {
    if (!user) {
      setProperties([]);
      return;
    }
    await fetch(
      combineUrlAndPath(
        process.env.REACT_APP_AUTH_API,
        `/api.php/user/${user.id}/properties`
      ),
      {
        headers: {
          "Content-Type": "application/json",
          APP_ID: tenant,
          token: token,
        },
        method: "GET",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (typeof data === "string") {
          data = JSON.parse(data);
        }
        setProperties(data);
      })
      .catch((err) => {
        if (onError) {
          onError("Auth: Unable to fetch properties", err);
        }
      });
  };

  const saveProperties = async (properties) => {
    if (!user || !properties || !Array.isArray(properties)) {
      return;
    }

    const savePromises = properties.map((property) => {
      const url = property.id
        ? `${process.env.REACT_APP_AUTH_API}/api.php/property/${property.id}`
        : `${process.env.REACT_APP_AUTH_API}/api.php/property/`;

      const method = property.id ? "PUT" : "POST";

      return fetch(url, {
        headers: {
          "Content-Type": "application/json",
          APP_ID: tenant,
          token: token,
        },
        method: method,
        body: JSON.stringify(property),
      });
    });

    try {
      await Promise.all(savePromises);
      await fetchProperties();
    } catch (err) {
      if (onError) {
        onError("Auth: Unable to save properties", err);
      }
    }
  };

  const saveUser = (newUser) => {
    fetch(
      combineUrlAndPath(
        process.env.REACT_APP_AUTH_API,
        `api.php/user/${user.id}`
      ),
      {
        body: JSON.stringify(newUser),
        headers: {
          "Content-Type": "application/json",
          APP_ID: tenant,
          token: token,
        },
        method: "PUT",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (typeof data === "string") {
          data = JSON.parse(data);
        }
        settoken(data.token);
        setUser(data);
      })
      .catch((err) => {
        if (onError) {
          onError("Auth: Unable to save user", err);
        }
      });
  };

  const oldIdToNewMapping = async (oldId) => {
    const resp = await fetch(
      combineUrlAndPath(
        process.env.REACT_APP_AUTH_API,
        `api.php/user/${oldId}/old`
      ),
      {
        headers: {
          "Content-Type": "application/json",
          APP_ID: tenant,
          token: token,
        },
      }
    );
    const data = await resp.json();
    return data[0].new_user_id;
  };

  const values = useMemo(
    () => ({
      token,
      register,
      login,
      requestMagicLink,
      loginWithMagicLink,
      logout,
      forgot,
      user,
      saveUser,
      setgoogleAccessToken,
      changePassword,
      impersonate,
      properties,
      saveProperties,
      oldIdToNewMapping,
    }),
    [
      token,
      register,
      login,
      requestMagicLink,
      loginWithMagicLink,
      logout,
      forgot,
      user,
      setgoogleAccessToken,
      changePassword,
      impersonate,
      properties,
      saveProperties,
      oldIdToNewMapping
    ]
  );

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthenticationContext.Provider value={values}>
        {children}
      </AuthenticationContext.Provider>
    </GoogleOAuthProvider>
  );
};

export { AuthenticationContext, AuthenticationProvider };
