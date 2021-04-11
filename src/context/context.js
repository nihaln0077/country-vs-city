import React from "react";
import { reducer } from "../Reducer/reducer";
import { GET_DATA, START_FETCH, NO_DATA, GET_DATA_BY_TIME } from "../actions";
import { database } from "../firebase/config";

import { generateId } from "../utils/helpers";

const AppContext = React.createContext();

const initialState = {
  countryData: [],
  cityData: [],
  loading: true,
  dataError: false,
};

const AppProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const [viewMore, setViewMore] = React.useState(false);
  const [save, setSave] = React.useState(false);
  const [global, setGlobal] = React.useState(true);
  const [sort, setSort] = React.useState("votes");

  const settingGlobal = () => {
    setGlobal(!global);
  };

  const addCard = (value, text) => {
    const time = generateId();
    database.ref(`cards/${value}/${new Date().getTime().toString()}`).set({
      text,
      spam_score: 0,
      votes: 0,
      time: time,
    });
    setSort("time");
    setGlobal(true);
  };

  const setSaving = (val) => setSave(val);

  const setView = () => setViewMore(!viewMore);

  const getCards = () => {
    dispatch({ type: START_FETCH });
    setGlobal(true);

    var ref = database.ref("cards");

    // Attach an asynchronous callback to read the data at our posts reference
    ref.on(
      "value",
      function (snapshot) {
        const data = snapshot.val();

        if (data) {
          dispatch({ type: GET_DATA, payload: data });
        } else {
          dispatch({ type: NO_DATA });
        }
      },
      function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      }
    );
  };

  const getCardsbyTime = () => {
    dispatch({ type: START_FETCH });
    setGlobal(true);

    var ref = database.ref("cards");
    ref.orderByChild("time").on(
      "value",
      (snapshot) => {
        const data = snapshot.val();

        if (data) {
          dispatch({ type: GET_DATA_BY_TIME, payload: data });
        } else {
          dispatch({ type: NO_DATA });
        }
      },
      function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      }
    );
  };

  const saveCountry = (result, value) => {
    if (result) {
      if (result["column-1"]) {
        result["column-1"].map((item, index) => {
          return database.ref(`cards/${value}/${item.id}`).update({
            votes: item.votes + (result["column-1"].length - index),
          });
        });
      }

      if (result["column-2"].length > 0) {
        result["column-2"].map((item) => {
          return database
            .ref(`cards/${value}/${item.id}`)
            .update({ spam_score: item.spam_score + 1 });
        });
        result["column-2"].map((item) => {
          if (item.spam_score >= 2) {
            return database.ref(`cards/${value}/${item.id}`).remove();
          }
          return 0;
        });
      }
    }
    if (sort === "votes") {
      getCards();
    } else {
      getCardsbyTime();
    }
  };

  const saveCity = (result, value) => {
    if (result) {
      if (result["column-1"]) {
        result["column-1"].map((item, index) => {
          return database.ref(`cards/${value}/${item.id}`).update({
            votes: item.votes + (result["column-1"].length - index),
          });
        });
      }

      if (result["column-2"]) {
        result["column-2"].map((item) => {
          return database
            .ref(`cards/${value}/${item.id}`)
            .update({ spam_score: item.spam_score + 1 });
        });
        result["column-2"].map((item) => {
          if (item.spam_score >= 2) {
            return database.ref(`cards/${value}/${item.id}`).remove();
          }
          return 0;
        });
      }
    }
    if (sort === "votes") {
      getCards();
    } else {
      getCardsbyTime();
    }
  };

  React.useEffect(() => {
    if (sort === "votes") {
      getCards();
    } else {
      getCardsbyTime();
    }
  }, [sort]);

  return (
    <AppContext.Provider
      value={{
        ...state,
        addCard,
        saveCity,
        setView,
        viewMore,
        save,
        setSaving,
        saveCountry,
        settingGlobal,
        global,
        sort,
        setSort,
      }}>
      {children}
    </AppContext.Provider>
  );
};

const useGlobalContext = () => {
  return React.useContext(AppContext);
};

export { AppProvider, useGlobalContext };
