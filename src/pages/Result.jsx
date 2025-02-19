import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-datepicker/dist/react-datepicker.css";
import "jspdf-autotable";
import "./dash/dashboard.css";

function Result() {
    const [fileFields, setFileFields] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fayl qo'shish funksiyasi
    const addFileField = () => {
        if (fileFields.length < 5) {
            setFileFields([...fileFields, { id: Date.now(), file: null, category: "", subject: "" }]);
        } else {
            alert("Siz maksimal 5 ta fayl qo'sha olasiz!");
        }
    };

    // Fayl maydonini yangilash
    const handleFileChange = (id, field, value) => {
        setFileFields(prevFields =>
            prevFields.map(fileField => fileField.id === id ? { ...fileField, [field]: value } : fileField)
        );
    };

    // Fayl maydonini olib tashlash
    const removeFileField = (id) => {
        setFileFields(prevFields => prevFields.filter(fileField => fileField.id !== id));
    };

    // Formani yuborish funksiyasi
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            for (let form of fileFields) {
                if (!form.file || !form.category || !form.subject) {
                    alert("Iltimos, barcha maydonlarni to‘ldiring va faylni tanlang.");
                    setIsLoading(false);
                    return;
                }

                const formData = new FormData();
                formData.append("file", form.file);
                formData.append("category", form.category);
                formData.append("subject", form.subject);

                await axios.post("https://scan-app-9206bf041b06.herokuapp.com/savol/yuklash/", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            const userInput = prompt("Savollar soni, sinf raqami, maktab nomini kiriting (masalan: 100, 7, Namuna Maktab)");
            if (!userInput) {
                alert("Iltimos, barcha ma'lumotlarni to‘ldiring.");
                setIsLoading(false);
                return;
            }

            const [value, grade, school] = userInput.split(",").map(item => item.trim());
            if (!value || isNaN(value) || parseInt(value) <= 0) {
                alert("Iltimos, to'g'ri savollar sonini kiriting.");
                setIsLoading(false);
                return;
            }

            const backupResponse = await axios.get("https://backup-questions-e95023d8185c.herokuapp.com/backup");
            const lastId = backupResponse.data.list_id;

            const questionsResponse = await axios.get("https://scan-app-9206bf041b06.herokuapp.com/savol/questions/");

            const finalData = [{
                num: { additional_value: parseInt(value), class: parseInt(grade), school, list_id: lastId },
                last_id: lastId,
                data: questionsResponse.data.data,
            }];

            await axios.post("https://scan-app-9206bf041b06.herokuapp.com/api/questions", finalData, {
                headers: { "Content-Type": "application/json" },
            });

            alert("Savollar muvaffaqiyatli yuborildi!");

            await fetch("https://scan-app-9206bf041b06.herokuapp.com/savol/delete-all-questions/", { method: "DELETE", headers: { "Content-Type": "application/json" } });
        } catch (error) {
            console.error("Xatolik yuz berdi:", error);
            alert("Xatolik yuz berdi: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container-fluid mt-4">
            <form className="d-flex flex-column align-items-center" onSubmit={handleSubmit}>
                <div className="file-fields-container mb-3">
                    {fileFields.map(fileField => (
                        <div key={fileField.id} className="file-fields mb-3">
                            <input type="file" accept=".zip" onChange={(e) => handleFileChange(fileField.id, "file", e.target.files[0])} required className="form-control mb-2" />
                            <select onChange={(e) => handleFileChange(fileField.id, "category", e.target.value)} required className="form-control mb-2">
                                <option value="">Kategoriya tanlang</option>
                                <option value="Majburiy_Fan_1">Majburiy_Fan_1</option>
                                <option value="Majburiy_Fan_2">Majburiy_Fan_2</option>
                                <option value="Majburiy_Fan_3">Majburiy_Fan_3</option>
                                <option value="Fan_1">Fan_1</option>
                                <option value="Fan_2">Fan_2</option>
                            </select>
                            <select onChange={(e) => handleFileChange(fileField.id, "subject", e.target.value)} required className="form-control mb-2">
                            <option value="">Mavzu tanlang</option>
                                        <option value="Ona_tili">Ona tili</option>
                                        <option value="Matematika">Matematika</option>
                                        <option value="Tarix">Tarix</option>
                                        <option value="Ingliz_tili">Ingliz tili</option>
                                        <option value="Biologiya">Biologiya</option>
                                        <option value="Huquq">Huquq</option>
                                        <option value="Fizika">Fizika</option>
                                        <option value="Kimyo">Kimyo</option>
                                        <option value="Algebra">Algebra</option>
                                        <option value="Geometriya">Geometriya</option>

                            </select>
                            <button type="button" className="btn btn-danger btn-sm mt-2" onClick={() => removeFileField(fileField.id)}>- Faylni o‘chirish</button>
                        </div>
                    ))}
                </div>
                <div className="d-flex justify-content-center w-100">
                    <button type="button" onClick={addFileField} className="btn btn-success btn-sm mx-3" disabled={fileFields.length >= 5}>+ Fayl qo‘shish</button>
                    <button type="submit" className="btn btn-primary btn-sm mx-3" disabled={isLoading}>{isLoading ? "Yuklanmoqda..." : "Yuborish"}</button>
                </div>
            </form>
        </div>
    );
}

export default Result;