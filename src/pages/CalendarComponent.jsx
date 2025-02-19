import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function CalendarComponent() {
  const [date, setDate] = useState(new Date());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData(date);
  }, [date]);

  const fetchData = async (selectedDate) => {
    setLoading(true);
    setError(null);
    const formattedDate = selectedDate.toISOString().split("T")[0];

    try {
      const response = await axios.get(
        `https://backup-questions-e95023d8185c.herokuapp.com/main/get-result/?date=${formattedDate}`
      );
      setData(response.data);
    } catch (err) {
      setError("Ma'lumotni olishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  // **Excel yuklab olish funksiyasi**
  const downloadExcel = () => {
    if (!data || data.length === 0) {
      alert("Yuklab olish uchun ma'lumot mavjud emas.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data); // JSON'ni Excelga aylantiramiz
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(blob, `results_${date.toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Kalendar orqali tanlang</h2>
      <Calendar onChange={setDate} value={date} />

      <div className="mt-4">
        <h3 className="text-lg font-semibold">Tanlangan sana: {date.toDateString()}</h3>

        {loading && <p>Yuklanmoqda...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {data && (
          <div className="mt-2 p-3 bg-gray-100 rounded">
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}

        {/* Excel yuklab olish tugmasi */}
        <button
          onClick={downloadExcel}
          className="btn btn-primary fw-bold px-4 py-2 transition"
          style={{
            transition: "all 0.3s ease-in-out",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#0056b3"; // Hover effekti
            e.target.style.transform = "scale(1.05)"; // Biroz kattalashish
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#007bff"; // Asl rangga qaytish
            e.target.style.transform = "scale(1)";
          }}
          onMouseDown={(e) => {
            e.target.style.backgroundColor = "#004085"; // Tugmaga bosilganda
            e.target.style.transform = "scale(0.95)"; // Biroz kichrayish (press effect)
          }}
          onMouseUp={(e) => {
            e.target.style.backgroundColor = "#0056b3"; // Tugma qo‘yib yuborilganda hover rangga qaytish
            e.target.style.transform = "scale(1.05)";
          }}
        >
          Excel formatida yuklab olish
        </button>

      </div>
    </div>
  );
}

export default CalendarComponent;
