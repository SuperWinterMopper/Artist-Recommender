"use client"
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`/flask/incomes`);
      const data = await response.json();
      console.log("data is ", data);

      setIncome(data[0]['amount']);
    };
    fetchData();
  }, []);

  const [income, setIncome] = useState(0);

  return (
    <div>
      <p>Hi income is {income}</p>
    </div>
  );
}
