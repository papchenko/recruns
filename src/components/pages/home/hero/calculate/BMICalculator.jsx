import { useState } from "react";

import './calculate.scss';

export default function BMICalculator() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [message, setMessage] = useState("");
  const [color, setColor] = useState("");

  const calculateBmi = (e) => {
    e.preventDefault();

    if (!height || !weight) {
      setColor("text-danger");
      setMessage("Fill in the Height and Weight 👨‍💻");
      setTimeout(() => setMessage(""), 4000);
      return;
    }

    const cm = height / 100;
    const kg = weight;
    const bmi = Math.round(kg / (cm * cm));

    if (bmi < 18.5) {
      setColor("text-primary");
      setMessage(`Your BMI is ${bmi} and you are skinny 😔`);
    } else if (bmi < 25) {
      setColor("text-success");
      setMessage(`Your BMI is ${bmi} and you are healthy 👌`);
    } else {
      setColor("text-warning");
      setMessage(`Your BMI is ${bmi} and you are overweight 😔`);
    }

    setHeight("");
    setWeight("");

    setTimeout(() => setMessage(""), 4000);
  };

  return (
    <form
      onSubmit={calculateBmi}
      className="calculator-bmi-wrapper row align-items-center justify-content-between w-100 gap-xl-0"
    >
      <h3 className="calculate-title" style={{opacity: "0.9"}} data-title="BMI Calculator">
        Calculate your BMI
      </h3>
      <p className="calculate-description">
        The body mass index (BMI) calculator calculates body mass index from your weight and height.
      </p>

      <div className="col-xl-2 calculate-info">
        <input
          type="number"
          placeholder="Height"
          className="calculate-input form-control"
          value={height}
          min="0"
          onChange={(e) => setHeight(e.target.value)}
        />
        <label className="calculate-label form-label fw-semibold fs-5 text-white">
        </label>
          {/* cm */}
      </div>

      <div className="col-xl-2 calculate-info">
        <input
          type="number"
          placeholder="Weight"
          className="calculate-input form-control"
          value={weight}
          min="0"
          onChange={(e) => setWeight(e.target.value)}
        />
        <label className="calculate-label form-label fw-semibold fs-5 text-white">
          {/* kg */}
        </label>
      </div>

      <div className="col-xl-2 calculate-info d-flex align-item-center justify-content-center">
        <button
          type="submit"
          className="button button-flex calculate-btn py-3 px-5 fs-6 text-white btn-primary fw-semibold" style={{borderRadius: "8px"}}
        >
          Calculate
        </button>
      </div>

      {message && (
        <p className={`calculate-message ${color}`} id="calculate-message">
          {message}
        </p>
      )}
    </form>
  );
}