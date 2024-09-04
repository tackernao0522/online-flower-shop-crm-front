import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { RootState } from "../store";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const router = useRouter();

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  return <>{childredn}</>;
};

export default PrivateRoute;
