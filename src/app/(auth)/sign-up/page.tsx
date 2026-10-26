import { redirectIfSign } from "@/lib/authentication";
import SignUpForm from "@/components/auth/sign-up-form";

const SignUpPage = async () => {
  await redirectIfSign();

  return (
    <div>
      <SignUpForm />
    </div>
  );
};

export default SignUpPage;
