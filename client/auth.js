const NodeRSA = require("node-rsa");
const axios = require("axios");
const { connectWebSocketWithToken, initializeWebRTC } = require("./webRTC");

// Actual clientId provided by your server
const clientId = "0094f56d15c36a1731e44002b790d5e0";

// Replace with the path to your RSA private key file
const pathToPrivateKey =
  "-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEAlPVtFcNqFzHkQAK3kNXg71v7f9m1ftnSNsNgqHNXBZbyYish\nexNYgIrDl9xlgvph9a45JmFD4JZD8AcYtap7f58MfrfhX5Cvw/w0lOcphM2K33Ir\nqQtUBh9pvWAx+c5LPuL4gXd8oYV5MvAjnEsn+5SHucMTgBoVaZhE6TE5AlRcRzQd\nFIdutqlf6/SznWWty4DeBDUe0kk5Fhvn+uGbISMymM+rmb9Qd8q1Nlumzg2aDmZz\nLSaOzyAkR9rWyo6UO3FjgIYv9TpmBufN/ERU+SRejjSgIvMwoIFN7SRB/up0IHh/\nP4XM89THQ+NJpE4UfiFSVBP2vt/IMKZfKFUfNQIDAQABAoIBAAegucFPjHM7ntCY\nUwYbrbUUJMDbSSwBw34Ca0S1A1PJ8weL5d8DkpiignmYU6ptX+7QySRp/qvVhg0Y\nj+9dl41le6JRkDzwj8+dbqPhYoLmc6IVmp7BccAOg7+q2WRNaBUEUm1uzPcIerhd\nC7XJM3bymDCvCKSasVYC8iRu3Nh9nVwt5LuVyOLnNEm1NFsWyT11mDuTJk6LAWZ/\n9SOZqR/j+RNqxWuSZGm+lHz6gCHfZTQmPZn/qRelvkgj4eHJTvuimc6Ta9fMvBCj\nOByFukCncbn//nU7uB9mSaGgNhK4fE8dwiF/GZxdmzjjWXWgvNe4pK5N2sPzSBu8\nzY9LIoECgYEA01Mw4IGb3ukZ1MM9LHhjUYQumEEDyqtvXcNFtJcSrUXERb1GwRVX\nxniRvdM2pGAdkuZN66WSQoPAwrerPCIdCT7EFOK/Qo1Jz8j6deaRZYPHcVqrKCH1\n2THSfvgKZEfzxNRbSbpI+b+686M2UvW/XthqhSyQxwt4BazqPouYdc0CgYEAtHMA\na8Fpit5V78fg3hU1SpAHsWHnpmgMNOphXYfnlscmGSWxIPS0boZ4QxeM+PEtbbah\ns8Em09KhwFA/7Tg4HuaWUA1b8vUrLmUJqeDFpDdLDDbDGjygyQGRvi6hDzn45Qeb\nvanCO5jaFkKAPHsg+y5L+haJgyrbs/GCqjdh5wkCgYEAp03Me2GBMrhfL/emPcfN\n8aJxdS67vr98+sF3NSMJsU5ztjbEhmbMSB/6WkuWjgpeP4e/ltlNcwV2HXJlycTE\nMiaT/GkLvLe5ARz/VUpGQBVVV+PNb4d7aQmtucHMEFp6npD0+OjXj4qAixTjFEjk\nykUSB/8hW8QzsGKWTRAdkt0CgYBRytbkAPVgFsuJNmZ9A8v2EjcKdkBUM1FlIuAj\nTxjwRTDFsUoKkCDBAH6+mowxwtA+rMu6+NAqr4zV6Qow8oytpQN5IbUN+YcrLm0k\n7Vdoyg9gZ+ojmFuhAO8Y73Xduv9QgRRc8feyn+QqttX9lCos8J1LrK+EHwcbF1uM\n4DGmUQKBgF+nR6mSFPTSXe4IEdgPdbj9ckd43BER1Ei8d+LrEGpIi41q5xexiYCY\n7xdjDU4BN9sNLdiR1cc+NhcNeByfYIXlDSpGpQFIsiY4v+VB6osFswwbBDsMT3Cb\nkth1RZg3ceLuDNXTNJZ//U006H65w/rdP7Peo42d0ZGHqP4gksoh\n-----END RSA PRIVATE KEY-----";
const privateKey = new NodeRSA(pathToPrivateKey);
const data = {
  clientId,
};
const dataString = JSON.stringify(data); // Convert data object to string
const signature = privateKey.sign(dataString, "base64", "utf8");

async function testFlow() {
  axios
    .post("http://localhost:3000/auth", {
      clientId, // Send clientId along with the signature
      signature,
    })
    .then((response) => {
      const { accessToken, refreshToken } = response.data;
      if (accessToken) connectWebSocketWithToken(accessToken);
      if (global.io) initializeWebRTC("testUserId");
    })
    .catch((error) => {
      console.error("Token request failed:", error.message);
    });
}

module.exports = { testFlow };
