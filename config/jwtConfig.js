const jwtConfig = {
  options: {
    algorithm: "RS512",
    expiresIn: "200m",
    issuer: "blindTaem",
    httpOnly: true,
  },
};

module.exports = jwtConfig;
