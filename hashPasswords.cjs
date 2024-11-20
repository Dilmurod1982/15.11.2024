const ibmdb = require("ibm_db");
const bcrypt = require("bcryptjs");

const dbConfig = {
  DATABASE: "DIL", // Название базы данных
  HOSTNAME: "localhost",
  PORT: 50000,
  PROTOCOL: "TCPIP",
  UID: "Dilmurod",
  PWD: "718210",
};

const hashPasswords = async () => {
  try {
    // Подключение к базе данных
    const conn = ibmdb.openSync(dbConfig);

    // Получение всех пользователей
    const users = conn.querySync("SELECT USERNAME, PASSWORD FROM USERS");
    console.log("Список пользователей:", users);

    // Хэширование и обновление паролей
    for (const user of users) {
      const hashedPassword = bcrypt.hashSync(user.PASSWORD, 10);
      console.log(
        `Хэшированный пароль для ${user.USERNAME}: ${hashedPassword}`
      );

      // Обновление пароля в базе данных
      const updateQuery = `
        UPDATE USERS
        SET PASSWORD = ?
        WHERE USERNAME = ?
      `;
      conn.querySync(updateQuery, [hashedPassword, user.USERNAME]);
    }

    console.log("Все пароли успешно хэшированы.");
    conn.closeSync();
  } catch (err) {
    console.error("Ошибка при хэшировании паролей:", err);
  }
};

hashPasswords();
