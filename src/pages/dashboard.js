import React, { useState, useEffect, useCallback } from "react";
import axios, { AxiosHeaders } from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';  // Bootstrap CSS
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Tab } from 'bootstrap';  // Bootstrap JS Tab moduli
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "jspdf-autotable";
import { saveAs } from "file-saver";
import "./dashboard.css";



function Dashboard() {
    const [errorMessage, setErrorMessage] = useState("");
    const [page, setPage] = useState(1);
    const [fileFields, setFileFields] = useState([]);
    const [selectedDate, setSelectedDate] = useState();  // Sana holati
    const [data, setData] = useState([]); // API'dan olingan ma'lumotlar
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [questionsCount, setQuestionsCount] = useState("");
    const [grade, setGrade] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    // Fayl qo'shish funksiyasi
    const addFileField = () => {
        if (fileFields.length < 5) {
            setFileFields([
                ...fileFields,
                { id: Date.now(), file: null, category: "", subject: "" },
            ]);
        } else {
            alert("Siz maksimal 5 ta fayl qo'sha olasiz!");
        }
    };

    // Fayl tanlashda ma'lumotni yangilash
    const handleFileChange = (id, field, value) => {
        const updatedFields = fileFields.map((fileField) =>
            fileField.id === id ? { ...fileField, [field]: value } : fileField
        );
        setFileFields(updatedFields);
    };

    // Fayl maydonini olib tashlash
    const removeFileField = (id) => {
        setFileFields(fileFields.filter((fileField) => fileField.id !== id));
    };

    // Formani yuborish funksiyasi
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Yuklanish holatini o‘rnatish

        try {
            // Hamma formalarni tekshirish
            for (let form of fileFields) {
                if (!form.file || !form.category || !form.subject) {
                    alert("Iltimos, barcha maydonlarni to‘ldiring va faylni tanlang.");
                    setLoading(false);
                    return;
                }

                // FormData ni to‘ldirish
                const formData = new FormData();
                formData.append("file", form.file);
                formData.append("category", form.category);
                formData.append("subject", form.subject);

                // Serverga yuborish
                const response = await axios.post(
                    "https://scan-app-9206bf041b06.herokuapp.com/savol/yuklash/",
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                console.log("Server javobi:", response.data);
            }

            const value = prompt("Nechta savol kerakligini kiriting:");
            const grade = prompt("Nechinchi sinf uchun savollar kerakligini kiriting:");

            if (!value || isNaN(value) || parseInt(value) <= 0) {
                alert("Iltimos, to'g'ri savollar sonini kiriting.");
                setIsLoading(false); // Yuklanish holatini o‘chirish
                return;
            }

            // Savollarni olish va yuborish 
            try {
                // Backup API'dan list_id ni olish
                const backupResponse = await axios.get(
                    "https://backup-questions-e95023d8185c.herokuapp.com/backup"
                );
                const backupData = backupResponse.data; // Masalan, { "list_id": 47 }
                const lastId = backupData.list_id;

                // Savollarni olish
                const questionsResponse = await axios.get(
                    "https://scan-app-9206bf041b06.herokuapp.com/savol/questions/"
                );
                const questionsData = questionsResponse.data;

                // Yakuniy ma'lumotlar strukturasi, unda:
                // - num obyektiga additional_value va class qiymatlari, shuningdek list_id qo'shildi;
                // - last_id kaliti ham listId qiymatini oladi.
                const finalData = [
                    {
                        num: {
                            additional_value: parseInt(value),
                            class: parseInt(grade),
                            list_id: lastId
                        },
                        last_id: lastId,
                        data: questionsData.data,
                    },
                ];
                // console.log("Final Data Structure:", JSON.stringify(finalData, null, 2));

                // Ma'lumotlarni yuborish
                await axios.post(
                    "https://scan-app-9206bf041b06.herokuapp.com/api/questions",
                    finalData,
                    {
                        headers: { "Content-Type": "application/json" },
                    }
                );

                alert("Savollar muvaffaqiyatli yuborildi!");

            } catch (error) {
                console.error("Xatolik yuz berdi:", error);
                alert("Xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.");
                setIsLoading(false);
            }


            // DELETE so'rovi yuborish
            try {
                const response = await fetch(
                    "https://scan-app-9206bf041b06.herokuapp.com/savol/delete-all-questions/",
                    {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (response.ok) {
                    console.log("Barcha savollar o‘chirildi!");
                } else {
                    console.error("Savollarni o‘chirishda xatolik yuz berdi", response.status);
                }
            } catch (error) {
                console.error("Tarmoq yoki server xatosi:", error);
            }
        } catch (error) {
            console.error("Xatolik yuz berdi:", error);
            setErrorMessage(error.message);
            alert("Xatolik yuz berdi: " + error.message);
        } finally {
            setIsLoading(false); // Holatni tiklash
        }
    };


    return (
        <div className="container-fluid mt-4">
            <ul className="nav nav-pills mb-3" id="pills-tab" role="tablist">
                <li className="nav-item">
                    <a className="nav-link active" id="pills-home-tab" data-bs-toggle="pill" href="#pills-home" role="tab" aria-controls="pills-home" aria-selected="true">
                        Home
                    </a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" id="pills-profile-tab" data-bs-toggle="pill" href="#pills-profile" role="tab" aria-controls="pills-profile" aria-selected="false">
                        Result
                    </a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" id="pills-contact-tab" data-bs-toggle="pill" href="#pills-contact" role="tab" aria-controls="pills-contact" aria-selected="false">
                        Dashboard
                    </a>
                </li>
            </ul>
            {/* Home Tab */}
            <div className="tab-content">
                <div className="tab-pane fade show active" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab">
                    <div className="container mt-4">
                        <div className="row">

                        </div>
                    </div>
                </div>

                {/* Result Tab */}
                <div
                    className="tab-pane fade"
                    id="pills-profile"
                    role="tabpanel"
                    aria-labelledby="pills-profile-tab"
                >
                    <form className="d-flex flex-column align-items-center" onSubmit={handleSubmit}>
                        <div className="file-fields-container mb-3">
                            {fileFields.map((fileField) => (
                                <div key={fileField.id} className="file-fields mb-3">
                                    <label htmlFor={`fileInput${fileField.id}`}>Fayl {fileField.id}:</label>
                                    <input
                                        type="file"
                                        id={`fileInput${fileField.id}`}
                                        name="files"
                                        accept=".zip"
                                        onChange={(e) => handleFileChange(fileField.id, "file", e.target.files[0])}
                                        required
                                        className="form-control mb-2"
                                    />
                                    <label htmlFor={`categorySelect${fileField.id}`}>Kategoriya:</label>
                                    <select
                                        id={`categorySelect${fileField.id}`}
                                        name="category"
                                        value={fileField.category}
                                        onChange={(e) => handleFileChange(fileField.id, "category", e.target.value)}
                                        required
                                        className="form-control mb-2"
                                    >
                                        <option value="">Kategoriya tanlang</option>
                                        <option value="Majburiy_Fan_1">Majburiy_Fan_1</option>
                                        <option value="Majburiy_Fan_2">Majburiy_Fan_2</option>
                                        <option value="Majburiy_Fan_3">Majburiy_Fan_3</option>
                                        <option value="Fan_1">Fan_1</option>
                                        <option value="Fan_2">Fan_2</option>
                                    </select>
                                    <label htmlFor={`subjectSelect${fileField.id}`}>Mavzu:</label>
                                    <select
                                        id={`subjectSelect${fileField.id}`}
                                        name="subject"
                                        value={fileField.subject}
                                        onChange={(e) => handleFileChange(fileField.id, "subject", e.target.value)}
                                        required
                                        className="form-control mb-2"
                                    >
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
                                    <button
                                        type="button"
                                        className="remove-file-btn btn btn-danger btn-sm mt-2"
                                        onClick={() => removeFileField(fileField.id)}
                                    >
                                        - Faylni o'chirish
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Fayl qo'shish va yuborish tugmalari */}
                        <div className="d-flex justify-content-center w-100">
                            <button
                                type="button"
                                onClick={addFileField}
                                className="btn btn-success btn-sm w-auto mx-5"
                                disabled={fileFields.length >= 5} // 5 tadan ortiq fayl qo'shishni cheklash
                            >
                                + Fayl qo'shish
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary btn-sm w-auto mx-5"
                                disabled={isLoading}  // Yuklanayotgan paytda tugmani o'chirib qo'yadi
                            >
                                {isLoading ? "Yuklanmoqda..." : "Yuborish"}
                            </button>

                        </div>

                        {/* Fayllar haqida ma'lumot */}
                        <div className="alert alert-info mt-3 w-100" role="alert">
                            <strong>Yuklangan fayllar:</strong>
                            <ul>
                                {fileFields.map((fileField) => (
                                    <li key={fileField.id}>
                                        Fayl: {fileField.file ? fileField.file.name : "Fayl tanlanmagan"} |
                                        Kategoriya: {fileField.category || "Tanlanmagan"} |
                                        Mavzu: {fileField.subject || "Tanlanmagan"}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </form>
                </div>
                {/* Dashboard Tab */}
                {/* <div className="tab-pane fade" id="pills-contact" role="tabpanel" aria-labelledby="pills-contact-tab">
                    <div className="container mt-4">
                        <div className="row">
                            <div className="container mt-5">
                                <h3>Dashboard</h3>
                                <DatePicker
                                    selected={selectedDate}
                                    onChange={handleDateChange}
                                    dateFormat="yyyy-MM-dd"
                                    className="form-control"
                                />
                                <button
                                    onClick={handleGeneratePdf}
                                    disabled={loading}
                                >
                                    {loading ? 'Yuklanmoqda...' : 'PDF Yaratish'}
                                </button>

                                {error && <div className="error">{error}</div>}
                                {successMessage && <div className="success">{successMessage}</div>}

                                {loading && (
                                    <div className="progress">
                                        <progress value={progress} max="100" />
                                        <span>{progress}% tugallandi</span>
                                    </div>
                                )}

                                {loading ? (
                                    <p>Yuklanmoqda...</p>
                                ) : error ? (
                                    <p className="text-danger">{error}</p>
                                ) : Object.keys(data).length > 0 ? (
                                    <div className="row mt-4">
                                        {Object.keys(data).map((groupKey, index) => (
                                            <div className="col-md-4 mb-4" key={index}>
                                                <div className="card">
                                                    <div className="card-header">
                                                        <h5>Sinf: {data[groupKey][0]?.question_class}</h5>
                                                    </div>
                                                    <div className="card-body">
                                                        <p><strong>Kategoriyalar:</strong> {data[groupKey][0]?.categories?.join(", ")}</p>
                                                        <p><strong>Fanlar:</strong> {data[groupKey][0]?.subjects?.join(", ")}</p>
                                                        <p><strong>Savollar soni:</strong> {data[groupKey].length}</p>
                                                        <button
                                                            className="btn btn-primary mt-3"
                                                            onClick={() => handleGeneratePdf(groupKey, selectedDate)} // to'g'ri argumentlar yuboriladi
                                                            disabled={isLoading} // Yuklash davomida tugma faolsiz bo'ladi
                                                        >
                                                            {isLoading ? "Yuklanmoqda..." : "Savollarni Yuklab Olish"}
                                                        </button>

                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>Hech qanday ma'lumot topilmadi</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>

    );
}

export default Dashboard;
