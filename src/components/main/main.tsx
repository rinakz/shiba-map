import { Tour } from "../tour";
import { USER_LOCALSTORAGE } from "../../constants/constants";
import { GeneralMap } from "../map/general-map";
import { useContext, useEffect } from "react";
import { supabase } from "../../api/supabase-сlient";
import { AppContext } from "../context/app-context";

export const Main = () => {
  const authUser = localStorage.getItem(USER_LOCALSTORAGE);

  const { user, setUser, setSibaIns, setMySiba } = useContext(AppContext);

  const getUserByEmail = async () => {
    if (authUser) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", JSON.parse(authUser).email);

      if (error) {
        console.error("Ошибка при получении пользователя:", error);
        return null;
      }

      setUser(data[0]);
    }
  };

  const getSibaIns = async () => {
    if (authUser) {
      const { data, error } = await supabase.from("sibains").select("*");

      if (error) {
        console.error("Ошибка при получении сиб:", error);
        return null;
      }

      setSibaIns(data);
    }
  };

  const getMySiba = async () => {
    if (authUser && user?.user_id) {
      const { data, error } = await supabase
        .from("sibains")
        .select("*")
        .eq("siba_user_id", user.user_id);

      if (error) {
        console.error("Ошибка при получении сибы:", error);
        return null;
      }

      setMySiba(data[0]);
    }
  };

  useEffect(() => {
    if (authUser) {
      getUserByEmail();
      getSibaIns();
      getMySiba();
    }
  }, [authUser]);

  return (
    <>
      {authUser ? (
        <div>
          <GeneralMap />
        </div>
      ) : (
        <Tour />
      )}
    </>
  );
};
