import bcrypt from "bcrypt";
import PasswordValidator from "password-validator";
import prisma from "../../libs/prisma";
import { logger } from "./Logger";

export const validateLoginVars = (email, password): boolean => {
  // email from https://stackoverflow.com/a/201378 which is good enough for now...
  const emailCheck =
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g;

  // password from https://www.npmjs.com/package/password-validator
  const passwordCheck = new PasswordValidator();
  passwordCheck
    .is()
    .min(8) // Minimum length 8
    .is()
    .max(100) // Maximum length 100
    .has()
    .uppercase() // Must have uppercase letters
    .has()
    .lowercase() // Must have lowercase letters
    .has()
    .symbols(1) // Must have at least 1 symbol
    .has()
    .digits(2) // Must have at least 2 digits
    .has()
    .not()
    .spaces() // Should not have spaces
    .is();
  // .not().oneOf([]);  //TODO: add password blacklist

  const emailResult = emailCheck.test(email);
  const passwordResult = passwordCheck.validate(password);

  if (!emailResult) {
    if (!passwordResult) {
      throw new Error(`error validating user email and password`);
    } else {
      throw new Error(`error validating user email`);
    }
    return false;
  } else if (!passwordResult) {
    throw new Error(`error validating user password`);
    return false;
  } else {
    return true;
  }
};

export const genPasswordHash = async (password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
};

export const checkPassword = async (password, email) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { email: email },
  });

  // password: "P@ssw0rd123"
  // email: "fake.email@localhost.net"
  const result = await bcrypt.compare(password, user.password);
  if (result) {
    // Passwords match, authentication successful, cannot get return for some reason but fails otherwise so default is to return id... not sure how else to do this.
    logger.info(`Passwords match! User authenticated for ${email}.`);
    return user.id;
  } else {
    // Passwords don't match, authentication failed
    throw new Error(
      `Passwords do not match! Authentication failed for ${email}.`
    );
  }
};
