import React, { useState } from "react";
import axios from "axios";

const AddDataForm = ({ onDataAdded }) => {
  const [field1, setField1] = useState("");
  const [field2, setField2] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/api/data", {
        field1,
        field2,
      });

      if (response.data.message === "Data inserted successfully") {
        onDataAdded(); // Обновляем данные на главной странице
        setField1("");
        setField2("");
        setError(""); // Очищаем ошибку
      }
    } catch (error) {
      console.error("Error adding data:", error);
      setError("Failed to add data");
    }
  };

  return (
    <div>
      <h2>Add New Data</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Field 1:</label>
          <input
            type="text"
            value={field1}
            onChange={(e) => setField1(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Field 2:</label>
          <input
            type="text"
            value={field2}
            onChange={(e) => setField2(e.target.value)}
            required
          />
        </div>
        {error && <div style={{ color: "red" }}>{error}</div>}
        <button type="submit">Add Data</button>
      </form>
    </div>
  );
};

export default AddDataForm;
