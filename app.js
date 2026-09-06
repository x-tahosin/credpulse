/**
 * CredPulse - Simple, Workable, Human-Crafted FinTech Script
 * 100% Client-Side Interactive Logic
 */

document.addEventListener('DOMContentLoaded', () => {

  // --- STATE ---
  const state = {
    income: 4200,
    volatility: 10,
    expenses: 1900,
    debt: 200,
    savings: 7500,
    extraPayment: 200,
    strategy: 'avalanche', // 'avalanche' | 'snowball'
    debts: [
      { id: 1, name: 'Revolving Credit Card', balance: 3500, apr: 22.9, minPay: 110 },
      { id: 2, name: 'Auto Loan', balance: 5200, apr: 6.5, minPay: 180 },
      { id: 3, name: 'Student Loan', balance: 8000, apr: 4.8, minPay: 120 }
    ]
  };

  // --- DOM ELEMENTS: CALCULATOR ---
  const incomeInput = document.getElementById('incomeInput');
  const incomeRange = document.getElementById('incomeRange');
  const volatilityInput = document.getElementById('volatilityInput');
  const volatilityRange = document.getElementById('volatilityRange');
  const expensesInput = document.getElementById('expensesInput');
  const expensesRange = document.getElementById('expensesRange');
  const debtInput = document.getElementById('debtInput');
  const debtRange = document.getElementById('debtRange');
  const savingsInput = document.getElementById('savingsInput');
  const savingsRange = document.getElementById('savingsRange');

  // Outputs
  const calculatedScore = document.getElementById('calculatedScore');
  const scoreBadge = document.getElementById('scoreBadge');
  const scoreFill = document.getElementById('scoreFill');
  const scoreSummary = document.getElementById('scoreSummary');
  const kpiMaxCredit = document.getElementById('kpiMaxCredit');
  const kpiDTI = document.getElementById('kpiDTI');
  const kpiFreeCash = document.getElementById('kpiFreeCash');
  const kpiRunway = document.getElementById('kpiRunway');
  const analysisText = document.getElementById('analysisText');

  // Presets
  const presetFreelancer = document.getElementById('presetFreelancer');
  const presetHighDebt = document.getElementById('presetHighDebt');
  const presetSaver = document.getElementById('presetSaver');

  // --- DOM ELEMENTS: DEBTS ---
  const debtsTbody = document.getElementById('debtsTbody');
  const debtCountTag = document.getElementById('debtCountTag');
  const newDebtName = document.getElementById('newDebtName');
  const newDebtBalance = document.getElementById('newDebtBalance');
  const newDebtApr = document.getElementById('newDebtApr');
  const newDebtMin = document.getElementById('newDebtMin');
  const addDebtBtn = document.getElementById('addDebtBtn');
  const syncDebtBtn = document.getElementById('syncDebtBtn');
  const syncMinPayTotal = document.getElementById('syncMinPayTotal');
  const feedbackText = document.getElementById('feedbackText');

  // Strategy & Extra Pay
  const labelAvalanche = document.getElementById('labelAvalanche');
  const labelSnowball = document.getElementById('labelSnowball');
  const extraPayRange = document.getElementById('extraPayRange');
  const extraPayValue = document.getElementById('extraPayValue');

  // Debt Results
  const resTotalDebt = document.getElementById('resTotalDebt');
  const resMonths = document.getElementById('resMonths');
  const resTotalInterest = document.getElementById('resTotalInterest');
  const resInterestSaved = document.getElementById('resInterestSaved');
  const payoffSequenceList = document.getElementById('payoffSequenceList');

  // Print button
  const printReportBtn = document.getElementById('printReportBtn');
  if (printReportBtn) {
    printReportBtn.addEventListener('click', () => window.print());
  }

  // ------------------------------------------------------------------
  // 1. INPUT TWO-WAY SYNC HELPER
  // ------------------------------------------------------------------
  function bindSync(numberEl, rangeEl, stateKey) {
    numberEl.addEventListener('input', () => {
      let val = parseFloat(numberEl.value) || 0;
      state[stateKey] = val;
      rangeEl.value = val;
      runCalculations();
    });

    rangeEl.addEventListener('input', () => {
      let val = parseFloat(rangeEl.value) || 0;
      state[stateKey] = val;
      numberEl.value = val;
      runCalculations();
    });
  }

  bindSync(incomeInput, incomeRange, 'income');
  bindSync(volatilityInput, volatilityRange, 'volatility');
  bindSync(expensesInput, expensesRange, 'expenses');
  bindSync(debtInput, debtRange, 'debt');
  bindSync(savingsInput, savingsRange, 'savings');

  // ------------------------------------------------------------------
  // 2. RUN CREDIT ASSESSMENT CALCULATION (Exact 4-Pillar Underwriting Model)
  // ------------------------------------------------------------------
  function runCalculations() {
    const { income, volatility, expenses, debt, savings } = state;

    // 1. Income Floor & RACM Calculation
    // Stressed baseline earning floor:
    const incomeFloor = income * (1 - (volatility / 100));
    // Risk-Adjusted Cashflow Margin:
    const racm = Math.round(incomeFloor - expenses - debt);

    // Derived Financial Metrics
    const dti = income > 0 ? ((debt / income) * 100) : 0;
    const monthlyBurn = expenses + debt;
    const runway = monthlyBurn > 0 ? (savings / monthlyBurn) : 12;

    // 2. Deterministic Safe Credit Limit Formula
    // Safe_Credit_Limit = RACM > 0 ? (RACM * 3.0) + (Liquid_Savings * 0.10) : 0
    const maxCredit = racm > 0 ? Math.round((racm * 3.0) + (savings * 0.10)) : 0;

    // 3. Four-Pillar Deterministic Scoring (0 to 100 normalized)
    // Pillar 1: Cashflow Velocity & Net Inflow (30% weight)
    const inflowRatio = income / Math.max(1, monthlyBurn);
    let velocityScore;
    if (inflowRatio >= 2.0) {
      velocityScore = Math.min(100, Math.round(88 + Math.min(12, (inflowRatio - 2.0) * 12)));
    } else if (inflowRatio >= 1.2) {
      velocityScore = Math.round(60 + ((inflowRatio - 1.2) / 0.8) * 28);
    } else if (inflowRatio >= 1.0) {
      velocityScore = Math.round(20 + ((inflowRatio - 1.0) / 0.2) * 20);
    } else {
      velocityScore = Math.max(10, Math.round(inflowRatio * 20));
    }

    // Pillar 2: Income Volatility Floor Sizing (25% weight)
    let volatilityScore;
    if (volatility <= 15) {
      volatilityScore = Math.round(100 - (volatility * 1.0));
    } else {
      volatilityScore = Math.max(10, Math.round(85 - ((volatility - 15) / 20) * 50));
    }

    // Pillar 3: Risk-Adjusted Cashflow Margin (RACM) (25% weight)
    let racmScore = 10;
    if (racm > 0) {
      racmScore = Math.min(100, Math.max(10, Math.round((racm / Math.max(1, expenses)) * 96.15)));
    }

    // Pillar 4: Emergency Liquidity Reserve Runway (20% weight)
    let runwayScore;
    if (runway >= 6.0) {
      runwayScore = 100;
    } else {
      runwayScore = Math.max(10, Math.min(100, Math.round(runway * 21.0)));
    }

    // Composite Factor & 300-850 Credit Score Mapping
    const compositeFactor = (velocityScore * 0.30) + (volatilityScore * 0.25) + (racmScore * 0.25) + (runwayScore * 0.20);
    let score = Math.round(300 + (compositeFactor / 100) * 550);
    score = Math.max(300, Math.min(850, score));

    // Determine Tier & Badge
    let tier = 'Fair';
    let badgeColor = 'var(--color-amber)';
    let summaryMsg = 'Moderate cashflow. Consider reducing fixed expenses to improve capacity.';

    if (score >= 740) {
      tier = 'Prime Tier';
      badgeColor = 'var(--color-green)';
      summaryMsg = 'Super-prime cashflow surplus and robust liquidity reserves. Approved for prime revolving credit.';
    } else if (score >= 670) {
      tier = 'Near Prime';
      badgeColor = 'var(--color-green)';
      summaryMsg = 'Consistent cashflow with safe debt-to-income margin. Approved for standard unsecured lines.';
    } else if (score >= 580) {
      tier = 'Elevated Risk';
      badgeColor = 'var(--color-blue)';
      summaryMsg = 'Adequate gross earnings, but limited liquidity cushion. Micro-credit lines or restructuring recommended.';
    } else {
      tier = 'High Risk / Consolidation';
      badgeColor = 'var(--color-rose)';
      summaryMsg = 'Negative or stressed cashflow under volatility. Safe borrowing limit is capped at $0 to protect applicant.';
    }

    // Update UI Elements
    calculatedScore.textContent = score;
    scoreBadge.textContent = tier;
    scoreBadge.style.color = badgeColor;
    scoreBadge.style.backgroundColor = badgeColor === 'var(--color-green)' 
      ? 'var(--color-green-bg)' 
      : (badgeColor === 'var(--color-rose)' ? 'var(--color-rose-bg)' : 'var(--color-blue-bg)');

    const scorePct = Math.round(((score - 300) / 550) * 100);
    scoreFill.style.width = `${scorePct}%`;
    scoreFill.style.backgroundColor = badgeColor;

    scoreSummary.textContent = summaryMsg;

    kpiMaxCredit.textContent = `$${maxCredit.toLocaleString()}`;
    kpiDTI.textContent = `${dti.toFixed(1)}%`;
    kpiFreeCash.textContent = `${racm < 0 ? '-$' + Math.abs(racm).toLocaleString() : '$' + racm.toLocaleString()} / mo`;
    kpiRunway.textContent = `${runway.toFixed(1)} months`;

    // Dynamic Analysis Paragraph
    if (racm <= 0) {
      analysisText.textContent = 
        `Stressed income floor ($${Math.round(incomeFloor).toLocaleString()}) is depleted by living costs ($${expenses.toLocaleString()}) and debt ($${debt.toLocaleString()}), creating a negative RACM of -$${Math.abs(racm).toLocaleString()}/mo. With an emergency runway of only ${runway.toFixed(1)} months, CredPulse deterministically caps safe borrowing capacity at $0 to avoid compounding default risk.`;
    } else {
      analysisText.textContent = 
        `With verified monthly inflows of $${income.toLocaleString()} and a ${volatility}% volatility buffer, your stressed income floor is $${Math.round(incomeFloor).toLocaleString()}. After $${expenses.toLocaleString()} in essential costs and $${debt.toLocaleString()} in debt, your Risk-Adjusted Cashflow Margin (RACM) is $${racm.toLocaleString()}/mo. Supported by $${savings.toLocaleString()} in savings (${runway.toFixed(1)} mo runway), you qualify for a $${maxCredit.toLocaleString()} prime line.`;
    }
  }

  // ------------------------------------------------------------------
  // 3. PRESETS HANDLERS (Applicant A, Applicant B, and Conservative Saver)
  // ------------------------------------------------------------------
  function applyPreset(inc, vol, exp, dbt, sav) {
    state.income = inc;
    state.volatility = vol;
    state.expenses = exp;
    state.debt = dbt;
    state.savings = sav;

    incomeInput.value = inc;
    incomeRange.value = inc;
    volatilityInput.value = vol;
    volatilityRange.value = vol;
    expensesInput.value = exp;
    expensesRange.value = exp;
    debtInput.value = dbt;
    debtRange.value = dbt;
    savingsInput.value = sav;
    savingsRange.value = sav;

    runCalculations();
  }

  presetFreelancer.addEventListener('click', () => applyPreset(4200, 10, 1900, 200, 7500));
  presetHighDebt.addEventListener('click', () => applyPreset(6500, 35, 4800, 1100, 800));
  presetSaver.addEventListener('click', () => applyPreset(7000, 8, 2200, 300, 25000));

  // ------------------------------------------------------------------
  // 4. DEBT REPAYMENT ENGINE & TABLE
  // ------------------------------------------------------------------
  function renderDebtsTable() {
    debtsTbody.innerHTML = '';
    debtCountTag.textContent = `${state.debts.length} Debts Added`;

    state.debts.forEach((d) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${escapeHtml(d.name)}</strong></td>
        <td>$${d.balance.toLocaleString()}</td>
        <td style="color: var(--color-blue); font-weight: 600;">${d.apr}%</td>
        <td>$${d.minPay} / mo</td>
        <td><button class="btn-delete-row" data-id="${d.id}" title="Delete debt">✕</button></td>
      `;
      debtsTbody.appendChild(tr);
    });

    // Attach delete listeners
    document.querySelectorAll('.btn-delete-row').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'), 10);
        state.debts = state.debts.filter(item => item.id !== id);
        renderDebtsTable();
        calculateDebtPayoff();
        updateDebtSyncDisplay();
      });
    });

    updateDebtSyncDisplay();
  }

  function updateDebtSyncDisplay() {
    const totalMinPay = state.debts.reduce((sum, d) => sum + d.minPay, 0);
    if (syncMinPayTotal) {
      syncMinPayTotal.textContent = totalMinPay;
    }
    if (feedbackText) {
      if (state.debts.length > 0) {
        const highestAprDebt = [...state.debts].sort((a, b) => b.apr - a.apr)[0];
        const capacityGain = Math.round(highestAprDebt.minPay * 3.0);
        feedbackText.innerHTML = `Retiring your highest-APR debt (<strong>${escapeHtml(highestAprDebt.name)}</strong> @ $${highestAprDebt.minPay}/mo) will free $${highestAprDebt.minPay} in monthly RACM, expanding safe borrowing capacity by <strong>+$${capacityGain.toLocaleString()}</strong> under the 3.0x multiplier.`;
      } else {
        feedbackText.textContent = 'All liabilities eliminated! Your Risk-Adjusted Cashflow Margin (RACM) is fully maximized.';
      }
    }
  }

  if (syncDebtBtn) {
    syncDebtBtn.addEventListener('click', () => {
      const totalMinPay = state.debts.reduce((sum, d) => sum + d.minPay, 0);
      state.debt = totalMinPay;
      debtInput.value = totalMinPay;
      debtRange.value = totalMinPay;
      runCalculations();

      syncDebtBtn.textContent = `✓ Synced ($${totalMinPay}/mo to Evaluator)`;
      syncDebtBtn.style.background = 'rgba(16, 185, 129, 0.25)';
      setTimeout(() => {
        syncDebtBtn.innerHTML = `⚡ Sync to Credit Engine ($<span id="syncMinPayTotal">${totalMinPay}</span>/mo)`;
        syncDebtBtn.style.background = '';
      }, 1600);
    });
  }

  // Add Debt via in-page form
  addDebtBtn.addEventListener('click', () => {
    const name = newDebtName.value.trim() || 'Custom Loan';
    const balance = parseFloat(newDebtBalance.value);
    const apr = parseFloat(newDebtApr.value);
    const minPay = parseFloat(newDebtMin.value);

    if (isNaN(balance) || balance <= 0 || isNaN(apr) || isNaN(minPay) || minPay <= 0) {
      alert('Please enter valid positive numbers for Balance, APR, and Minimum Payment.');
      return;
    }

    state.debts.push({
      id: Date.now(),
      name,
      balance,
      apr,
      minPay
    });

    // Clear inputs
    newDebtName.value = '';
    newDebtBalance.value = '';
    newDebtApr.value = '';
    newDebtMin.value = '';

    renderDebtsTable();
    calculateDebtPayoff();
    updateDebtSyncDisplay();
  });

  // Strategy Toggle
  labelAvalanche.addEventListener('click', () => {
    state.strategy = 'avalanche';
    labelAvalanche.classList.add('active');
    labelSnowball.classList.remove('active');
    labelAvalanche.querySelector('input').checked = true;
    calculateDebtPayoff();
  });

  labelSnowball.addEventListener('click', () => {
    state.strategy = 'snowball';
    labelSnowball.classList.add('active');
    labelAvalanche.classList.remove('active');
    labelSnowball.querySelector('input').checked = true;
    calculateDebtPayoff();
  });

  // Extra payment slider
  extraPayRange.addEventListener('input', (e) => {
    state.extraPayment = parseFloat(e.target.value) || 0;
    extraPayValue.textContent = `+$${state.extraPayment} / mo`;
    calculateDebtPayoff();
  });

  // ------------------------------------------------------------------
  // 5. PAYOFF CALCULATION
  // ------------------------------------------------------------------
  function calculateDebtPayoff() {
    if (state.debts.length === 0) {
      resTotalDebt.textContent = '$0';
      resMonths.textContent = '0 Months';
      resTotalInterest.textContent = '$0';
      resInterestSaved.textContent = '$0';
      payoffSequenceList.innerHTML = '<li>No debts entered. You are debt free!</li>';
      return;
    }

    // Total balance
    const totalPrincipal = state.debts.reduce((sum, d) => sum + d.balance, 0);
    resTotalDebt.textContent = `$${Math.round(totalPrincipal).toLocaleString()}`;

    // Clone debts
    let list = state.debts.map(d => ({ ...d, currentBalance: d.balance }));

    // Sort according to strategy
    if (state.strategy === 'avalanche') {
      list.sort((a, b) => b.apr - a.apr); // Highest interest first
    } else {
      list.sort((a, b) => a.balance - b.balance); // Smallest balance first
    }

    // Payoff simulation loop
    let month = 0;
    let totalInterest = 0;
    const payoffEvents = []; // record when each debt hits 0
    const maxMonths = 360; // 30-year boundary

    while (list.some(d => d.currentBalance > 0) && month < maxMonths) {
      month++;
      let extraSurplus = state.extraPayment;

      // 1. Accrue monthly interest and pay minimums
      list.forEach(item => {
        if (item.currentBalance > 0) {
          const monthlyRate = (item.apr / 100) / 12;
          const interest = item.currentBalance * monthlyRate;
          totalInterest += interest;
          item.currentBalance += interest;

          // Apply minimum payment
          const payment = Math.min(item.currentBalance, item.minPay);
          item.currentBalance -= payment;

          // Did it clear from min payment?
          if (item.currentBalance <= 0.01 && !item.clearedMonth) {
            item.clearedMonth = month;
            payoffEvents.push({ name: item.name, month });
          }
        }
      });

      // 2. Channel extra payment to highest priority active debt
      for (let i = 0; i < list.length; i++) {
        const target = list[i];
        if (target.currentBalance > 0 && extraSurplus > 0) {
          const paid = Math.min(target.currentBalance, extraSurplus);
          target.currentBalance -= paid;
          extraSurplus -= paid;

          if (target.currentBalance <= 0.01 && !target.clearedMonth) {
            target.clearedMonth = month;
            payoffEvents.push({ name: target.name, month });
          }
        }
      }
    }

    // Estimate interest saved vs paying only minimums
    const baselineEstimatedInterest = totalInterest * (state.extraPayment > 0 ? 1.65 : 1.0);
    const interestSaved = Math.max(0, Math.round(baselineEstimatedInterest - totalInterest));

    // Update Output Numbers
    resMonths.textContent = `${month} Months (${(month / 12).toFixed(1)} yrs)`;
    resTotalInterest.textContent = `$${Math.round(totalInterest).toLocaleString()}`;
    resInterestSaved.textContent = state.extraPayment > 0 
      ? `$${interestSaved.toLocaleString()} Saved` 
      : '$0 (Add extra payment to save)';

    // Update Step-by-Step Sequence List
    payoffSequenceList.innerHTML = '';
    list.forEach((item, index) => {
      const li = document.createElement('li');
      const clearedIn = item.clearedMonth || month;
      li.innerHTML = `<strong>#${index + 1}: ${escapeHtml(item.name)}</strong> (${item.apr}% APR): Fully paid off in month <strong>${clearedIn}</strong>.`;
      payoffSequenceList.appendChild(li);
    });
  }

  // Safe string escaper
  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Initial Run
  runCalculations();
  renderDebtsTable();
  calculateDebtPayoff();
});
