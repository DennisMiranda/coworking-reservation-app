//validate password matching
function validatePasswordMatch(
  password: string,
  confirmPassword: string
): boolean {
  return password === confirmPassword;
}

//validate password security
function validatePasswordSecurity(password: string): boolean {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]{8,}$/;

  return passwordRegex.test(password);
}

const MESSAGE_ERROR = {
  security:
    "Password must be at least 8 characters with uppercase, lowercase, number, and symbol",
  match: "Passwords do not match",
};

export function validatePassword(password: string, confirmPassword: string) {
  let message = "";
  if (!validatePasswordSecurity(password)) {
    message = MESSAGE_ERROR.security;
  } else if (!validatePasswordMatch(password, confirmPassword)) {
    message = MESSAGE_ERROR.match;
  }
  return {
    result: message == "",
    message,
  };
}
