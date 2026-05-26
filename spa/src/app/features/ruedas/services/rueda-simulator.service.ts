import { Injectable } from '@angular/core';
import {
  NextRuedaMonth,
  NextRuedaPersonMonth,
  NextRuedaResult,
  NextRuedaSimulatorRequest,
  RuedaSimulatorMonth,
  RuedaSimulatorRequest,
  RuedaSimulatorResult,
} from '../models/rueda-simulator.model';

@Injectable({ providedIn: 'root' })
export class RuedaSimulatorService {
  // Simple interest: total interest = loanAmount × rate/100, divided evenly across participants months.
  // Returns the total monthly loan payment (all participants combined).
  computeFixedLoanPayment(loanAmount: number, interestRate: number, participants: number): number {
    if (participants <= 0 || loanAmount <= 0) return 0;
    const totalToRepay = loanAmount + Math.round(loanAmount * interestRate / 100);
    return Math.round(totalToRepay / participants);
  }

  simulate(request: RuedaSimulatorRequest): RuedaSimulatorResult {
    const participants = Math.max(1, Math.trunc(request.participantsCount));
    const monthsCount = participants;
    const contributionPerPerson = Math.max(0, request.contributionAmount);
    const paymentMode = request.paymentMode;
    const rate = Math.max(0, request.interestRate);
    const loanAmount = Math.max(0, request.estimatedLoanAmount);

    const previousInstallment = Math.max(0, request.previousInstallmentPerPerson ?? 0);
    const previousActive = Math.max(0, Math.trunc(request.previousActiveCount ?? 0));

    // Auto-compute fixed payment if not manually provided
    const autoFixedPayment = this.computeFixedLoanPayment(loanAmount, rate, participants);
    const fixedLoanPayment = paymentMode === 'fixed'
      ? (request.fixedLoanPayment > 0 ? request.fixedLoanPayment : autoFixedPayment)
      : 0;

    // Simple interest model for fixed mode: split evenly across months
    const totalSimpleInterest = Math.round(loanAmount * rate / 100);
    const monthlyInterest = participants > 0 ? Math.round(totalSimpleInterest / participants) : 0;
    const monthlyAmortization = participants > 0 ? Math.round(loanAmount / participants) : 0;

    let loanBalance = loanAmount;
    let currentCash = Math.max(0, request.openingCash);

    const months: RuedaSimulatorMonth[] = [];
    let totalLoanPaid = 0;
    let totalInterestPaid = 0;
    let totalCollected = 0;

    for (let index = 1; index <= monthsCount; index += 1) {
      const monthLabel = `Mes ${index}`;
      const startingCash = currentCash;

      // Previous rueda pool: one person "exits" old rueda each month
      const prevPayers = Math.max(0, previousActive - (index - 1));
      const previousPool = prevPayers * previousInstallment;

      const newContributions = participants * contributionPerPerson;
      const monthlyCollection = newContributions + previousPool;

      let interestCost = 0;
      let loanPayment = 0;

      if (loanBalance > 0) {
        if (paymentMode === 'fixed') {
          // Simple interest: fixed monthly interest + amortization regardless of remaining balance
          interestCost = Math.min(monthlyInterest, loanBalance);
          const principal = Math.min(monthlyAmortization, Math.max(0, loanBalance - interestCost));
          loanPayment = interestCost + principal;
        } else {
          // Sequential: pay as much as possible; interest on declining balance
          interestCost = Math.round(loanBalance * rate / 100);
          loanPayment = Math.min(monthlyCollection, loanBalance + interestCost);
        }
      }

      const principalPayment = Math.max(0, loanPayment - interestCost);
      loanBalance = Math.max(0, loanBalance - principalPayment);

      const cashFlow = monthlyCollection - loanPayment;
      currentCash = startingCash + cashFlow;

      totalLoanPaid += loanPayment;
      totalInterestPaid += interestCost;
      totalCollected += monthlyCollection;

      months.push({
        position: index,
        monthLabel,
        startingCash,
        newContributions,
        previousPool,
        previousPayersCount: prevPayers,
        monthlyCollection,
        interestCost,
        loanPayment,
        principalPayment,
        cashFlow,
        endingCash: currentCash,
        remainingLoanBalance: loanBalance,
      });
    }

    const perPersonLoanPayment = participants > 0 ? Math.round(fixedLoanPayment / participants) : 0;

    return {
      months,
      totalCollected,
      totalLoanPaid,
      totalInterestPaid,
      endingCash: currentCash,
      remainingLoanBalance: loanBalance,
      monthlyCollection: months.length > 0 ? months[0].monthlyCollection : 0,
      perPersonPayment: contributionPerPerson + perPersonLoanPayment,
      computedFixedLoanPayment: autoFixedPayment,
      perPersonLoanPayment,
    };
  }

  simulateNextRueda(req: NextRuedaSimulatorRequest): NextRuedaResult {
    const N = Math.max(1, Math.trunc(req.participantsCount));
    const oldInstallment = Math.max(0, req.oldInstallmentPerPerson);
    const loanPerPerson = Math.max(0, req.loanPerPerson);
    const rate = Math.max(0, req.interestRate);
    const contribution = Math.max(0, req.contributionAmount);

    const totalToRepayPerPerson = loanPerPerson + Math.round(loanPerPerson * rate / 100);
    const newInstallmentPerPerson = N > 0 ? Math.round(totalToRepayPerPerson / N) : 0;

    let cajaBalance = Math.max(0, req.openingCash);
    const months: NextRuedaMonth[] = [];
    // matrix[personIndex 0-based][monthIndex 0-based]
    const matrix: NextRuedaPersonMonth[][] = Array.from({ length: N }, () => []);

    for (let k = 1; k <= N; k++) {
      // Person k gets the loan this month; they still pay old installment in this month.
      // From month k+1 onward they pay new installment.
      const oldPayers = N - (k - 1); // includes person k
      const newPayers = k - 1;

      const oldInstallmentsTotal = oldPayers * oldInstallment;
      const newInstallmentsTotal = newPayers * newInstallmentPerPerson;
      const contributionsTotal = N * contribution;
      const totalIncoming = oldInstallmentsTotal + newInstallmentsTotal + contributionsTotal;
      const loanDisbursed = loanPerPerson;
      const netCashFlow = totalIncoming - loanDisbursed;
      cajaBalance += netCashFlow;

      months.push({
        monthIndex: k,
        oldInstallmentPayers: oldPayers,
        newInstallmentPayers: newPayers,
        oldInstallmentsTotal,
        newInstallmentsTotal,
        contributionsTotal,
        totalIncoming,
        loanDisbursed,
        netCashFlow,
        cajaBalance,
      });

      for (let p = 1; p <= N; p++) {
        let paymentType: NextRuedaPersonMonth['paymentType'];
        let installmentAmount: number;

        if (p < k) {
          paymentType = 'new_installment';
          installmentAmount = newInstallmentPerPerson;
        } else if (p === k) {
          paymentType = 'loan_received';
          installmentAmount = oldInstallment;
        } else {
          paymentType = 'old_installment';
          installmentAmount = oldInstallment;
        }

        matrix[p - 1].push({
          personIndex: p,
          month: k,
          paymentType,
          installmentAmount,
          totalAmount: installmentAmount + contribution,
        });
      }
    }

    return {
      months,
      matrix,
      newInstallmentPerPerson,
      finalCajaBalance: cajaBalance,
      totalDisbursed: N * loanPerPerson,
    };
  }
}
