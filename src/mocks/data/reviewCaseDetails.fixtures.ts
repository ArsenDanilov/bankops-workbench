import type { ReviewCaseDetails } from '../../pages/ReviewCaseWorkspacePage/model/reviewCase.types';

export const CANONICAL_REVIEW_CASE_ID = 'RC-260907-0314';

export const canonicalReviewCaseDetails = {
  case: {
    id: CANONICAL_REVIEW_CASE_ID,
    lifecycle: 'in_review',
    version: 3,
    operationId: 'OP-260907-0718',
    assignedAnalystId: 'analyst-current',
    startedAt: '2026-09-07T13:08:04+03:00',
    createdAt: '2026-09-07T13:06:21+03:00',
    updatedAt: '2026-09-07T13:08:04+03:00',
  },
  ownership: {
    status: 'current_analyst',
    analystId: 'analyst-current',
    analystDisplayName: 'Current analyst',
  },
  sla: {
    state: 'due_soon',
    dueAt: '2026-09-07T13:42:00+03:00',
    remainingMinutes: 11,
  },
  contexts: {
    operation: {
      requirement: 'required',
      availability: 'available',
      data: {
        operation: {
          id: 'OP-260907-0718',
          amount: 286_000,
          currency: 'RUB',
          initiatedAt: '2026-09-07T13:06:18+03:00',
          status: 'held',
        },
        customer: {
          displayName: 'Александра Виноградова',
          maskedSourceAccount: '•••• 4382',
        },
        recipient: {
          displayName: 'Михаил Андреевич Сафронов',
          maskedRecipientAccount: '•••• 9127',
        },
        paymentPurpose: 'Возврат долга',
      },
    },
    riskAssessment: {
      requirement: 'required',
      availability: 'available',
      data: {
        id: 'RA-260907-0314-01',
        score: 78,
        assessedAt: '2026-09-07T13:08:00+03:00',
        signals: [
          {
            code: 'unusual_amount',
            evidenceSnapshot: {
              summary: '286 000 ₽ is 6.7× above the 90-day median',
              capturedAt: '2026-09-07T13:08:00+03:00',
            },
          },
          {
            code: 'new_recipient',
            evidenceSnapshot: {
              summary: 'No previous successful transfers',
              capturedAt: '2026-09-07T13:08:00+03:00',
            },
          },
          {
            code: 'device_change',
            evidenceSnapshot: {
              summary: 'Current device was first seen today',
              capturedAt: '2026-09-07T13:08:00+03:00',
            },
          },
        ],
      },
    },
    customerBehavior: {
      requirement: 'required',
      availability: 'available',
      data: {
        asOf: '2026-09-07T13:06:20+03:00',
        sourceSnapshotId: 'EV-CUST-0314-20260907',
        history: { windowDays: 90, outgoingTransferCount: 46 },
        amounts: {
          currency: 'RUB',
          current: 286_000,
          median90d: 42_600,
          typicalRange: { minimum: 18_000, maximum: 86_000 },
          deviationMultiplier: 6.7,
        },
        activity: {
          recentOutgoingTransfers: { last24Hours: 1, last7Days: 7 },
          usualFrequency: { minimum: 3, maximum: 5, period: 'week' },
        },
      },
    },
    recipientRelationship: {
      requirement: 'required',
      availability: 'available',
      data: {
        relationship: 'new',
        previousSuccessfulTransferCount: 0,
        firstObservedAt: '2026-09-07T13:06:18+03:00',
      },
    },
    device: {
      requirement: 'required',
      availability: 'available',
      data: {
        current: { operatingSystem: 'Windows 11', browser: 'Chrome' },
        firstSeenAt: '2026-09-07T12:58:42+03:00',
        knownRecentPattern: { device: 'iPhone 15', channel: 'mobile' },
      },
    },
    location: {
      requirement: 'not_relevant',
      availability: 'not_applicable',
    },
    transactionHistory: {
      requirement: 'required',
      availability: 'available',
      data: {
        sourceSnapshotId: 'EV-CUST-0314-20260907',
        asOf: '2026-09-07T13:06:20+03:00',
      },
    },
  },
  decisionReadiness: { status: 'ready' },
} satisfies ReviewCaseDetails;
