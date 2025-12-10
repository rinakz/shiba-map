import { USER_LOCALSTORAGE } from "../../shared/constants/constants";
import { useContext, useEffect } from "react";
import { supabase } from "../../shared/api/supabase-сlient";
import { AppContext } from "../../shared/context/app-context";
import { GeneralMap, Tour } from "../../feature";

export const MainPage = () => {
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

  // при входе на главную получаем юзера и весь список сибиков
  useEffect(() => {
    if (authUser) {
      getUserByEmail();
      getSibaIns();
    }
  }, [authUser]);

  // при получении текущего юзера делаем запрос на его сибу
  useEffect(() => {
    if (authUser && user?.user_id) {
      getMySiba();
    }
  }, [authUser, user]);

  return authUser ? <GeneralMap /> : <Tour />;
};
