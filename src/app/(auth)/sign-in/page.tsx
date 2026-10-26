import SignInForm from "@/components/auth/sign-in-form";
import { redirectIfSign } from "@/lib/authentication";

const SignInPage = async () => {
  await redirectIfSign();
  return (
    <div>
      <SignInForm></SignInForm>
    </div>
  );
};

export default SignInPage;
