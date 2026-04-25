import { useState, useMemo } from 'react';

// 2024 Federal Poverty Level by household size
const FPL = {
  2: 20440,
  3: 25820,
  4: 31200,
  5: 36580,
  6: 41960,
  7: 47340,
  8: 52720,
};

// GOAL flat award by grade band (no income test)
const GOAL_AWARDS = {
  'k5':  4800,
  '68':  5200,
  '912': 5500,
};

function calcGRACE(tuition, income, householdSize) {
  const fpl = FPL[householdSize] ?? FPL[4];
  const pct = (income / fpl) * 100;
  if (pct <= 185) return Math.min(tuition * 0.90, 9500);
  if (pct <= 250) return Math.min(tuition * 0.75, 7500);
  if (pct <= 350) return Math.min(tuition * 0.60, 6000);
  return Math.min(tuition * 0.40, 4500);
}

function calcApogee(tuition, income, householdSize) {
  const fpl = FPL[householdSize] ?? FPL[4];
  const pct = (income / fpl) * 100;
  if (pct <= 200) return Math.min(tuition * 0.85, 8500);
  if (pct <= 300) return Math.min(tuition * 0.65, 6500);
  return Math.min(tuition * 0.50, 5000);
}

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

const SSO_TABS = [
  { id: 'goal',   label: 'Georgia GOAL' },
  { id: 'grace',  label: 'GRACE Scholars' },
  { id: 'apogee', label: 'Apogee' },
];

const GRADE_BANDS = [
  { id: 'k5',  label: 'K–5th' },
  { id: '68',  label: '6th–8th' },
  { id: '912', label: '9th–12th' },
];

export default function GOALCalculator() {
  const [sso, setSso]                 = useState('goal');
  const [grade, setGrade]             = useState('k5');
  const [householdSize, setHousehold] = useState(4);
  const [income, setIncome]           = useState(60000);
  const [tuition, setTuition]         = useState(12000);

  const needsIncome = sso !== 'goal';

  const award = useMemo(() => {
    if (sso === 'goal')   return GOAL_AWARDS[grade];
    if (sso === 'grace')  return calcGRACE(tuition, income, householdSize);
    if (sso === 'apogee') return calcApogee(tuition, income, householdSize);
    return 0;
  }, [sso, grade, income, householdSize, tuition]);

  const netAnnual  = Math.max(0, tuition - award);
  const netMonthly = Math.round(netAnnual / 12);
  const coversMost = award >= tuition * 0.80;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 space-y-6 not-prose">

      {/* SSO selector */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Scholarship organization (SSO)
        </p>
        <div className="flex flex-wrap gap-2">
          {SSO_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSso(tab.id)}
              className={[
                'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                sso === tab.id
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400 hover:text-emerald-700',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grade band */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Grade level
        </p>
        <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
          {GRADE_BANDS.map((band, i) => (
            <button
              key={band.id}
              onClick={() => setGrade(band.id)}
              className={[
                'px-4 py-1.5 text-sm font-medium transition-colors',
                i > 0 ? 'border-l border-slate-200' : '',
                grade === band.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50',
              ].join(' ')}
            >
              {band.label}
            </button>
          ))}
        </div>
      </div>

      {/* Income inputs (hidden for GOAL) */}
      {needsIncome && (
        <>
          {/* Household size stepper */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Household size
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setHousehold((v) => Math.max(2, v - 1))}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors text-lg leading-none"
                aria-label="Decrease household size"
              >
                −
              </button>
              <span className="w-8 text-center font-semibold text-slate-800 text-lg">
                {householdSize}
              </span>
              <button
                onClick={() => setHousehold((v) => Math.min(8, v + 1))}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors text-lg leading-none"
                aria-label="Increase household size"
              >
                +
              </button>
              <span className="text-sm text-slate-500">
                FPL: {fmt(FPL[householdSize] ?? FPL[4])}
              </span>
            </div>
          </div>

          {/* Income slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Annual household income
              </p>
              <span className="text-sm font-semibold text-slate-800">{fmt(income)}</span>
            </div>
            <input
              type="range"
              min={20000}
              max={200000}
              step={1000}
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="w-full accent-emerald-600"
              aria-label="Annual household income"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-0.5">
              <span>$20k</span>
              <span>$200k</span>
            </div>
          </div>
        </>
      )}

      {/* Tuition slider */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Annual private school tuition
          </p>
          <span className="text-sm font-semibold text-slate-800">{fmt(tuition)}</span>
        </div>
        <input
          type="range"
          min={5000}
          max={35000}
          step={500}
          value={tuition}
          onChange={(e) => setTuition(Number(e.target.value))}
          className="w-full accent-emerald-600"
          aria-label="Annual private school tuition"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-0.5">
          <span>$5k</span>
          <span>$35k</span>
        </div>
      </div>

      {/* Result card */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 space-y-3">
        <div>
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-0.5">
            Estimated award
          </p>
          <p className="text-4xl font-bold text-emerald-700">
            {fmt(award)}
            <span className="text-base font-semibold text-emerald-600">/year</span>
          </p>
        </div>

        <div className="border-t border-emerald-200 pt-3 flex flex-wrap gap-x-6 gap-y-1">
          <div>
            <p className="text-xs text-emerald-600 mb-0.5">Net tuition</p>
            <p className="text-lg font-bold text-slate-800">
              {fmt(netAnnual)}<span className="text-sm font-medium text-slate-500">/year</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-emerald-600 mb-0.5">Monthly cost</p>
            <p className="text-lg font-bold text-slate-800">
              {fmt(netMonthly)}<span className="text-sm font-medium text-slate-500">/mo</span>
            </p>
          </div>
        </div>

        {coversMost && (
          <div className="flex items-center gap-2 bg-white border border-emerald-200 rounded-lg px-3 py-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-emerald-600 shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium text-emerald-800">
              This could cover most of your tuition
            </p>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-slate-400 italic leading-relaxed">
        Estimate based on 2024-25 published rates. Verify current amounts with your SSO.
        Award amounts and eligibility criteria change annually.
      </p>
    </div>
  );
}
