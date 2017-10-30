import { waitsFor } from 'mocha-waitsfor';
import Promise from 'bluebird';
import $ from 'jquery';
import ko from 'knockout';

function logout() {
    return new Promise((fulfill, reject) => {
        $.ajax({
            type: 'GET',
            url: 'http://localhost:9005/auth/logout',
            //
            // Why does the logout work when i removed the crossDomain and xhrFields ?
            //
            // crossDomain: true,
            // xhrFields: {
            //    withCredentials: true
            // },
            success: function () {
                // console.log('logged out successfully');
                fulfill();
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                reject(`Failed to authenticate${textStatus}${errorThrown}`);
            }
        });
    });
}
function login(username, password) {
    // console.log(`username: ${username} password: ${password}`);
    return new Promise((fulfill, reject) => {
        $.ajax({
            type: 'POST',
            url: 'http://localhost:9005/auth/login',
            data: {
                username: username,
                password: password || ''
            },
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            success: function () {
                // console.log('data util');
                fulfill();
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                reject(`Failed to authenticate${textStatus}${errorThrown}`);
            }
        });
    });
}
function getElement(selector) {
    let $elem;
    return new Promise((fulfill, reject) => {
        waitsFor(() => {
            $elem = $(selector);
            return $elem.length > 0;
        })
            .then(() => {
                fulfill($elem);
            })
            .catch(reject);
    });
}

// function getElementsAsDictionary($elem) {
//     return new Promise((fulfill, reject) =>
//          getElement($elem)
//             .then(result => _convertToDictionary(result))
//             .then(dictionary => fulfill(dictionary))
//             .catch(reject)
//     );
// }

// todo:  this is not async, why is it a promise?
function convertToDictionary($elem) {
    return new Promise((fulfill) => {
        const dictionary = _convertToDictionary($elem);
        fulfill(dictionary);
    });
}
function _convertToDictionary($elem) {
    const object = {};
    if ($elem.length > 0) {
        $elem.each(function () {
            const viewModel = ko.dataFor(this);
            if (viewModel && viewModel.id) {
                object[viewModel.id] = {
                    element: this,
                    viewModel: viewModel,
                    jq: $(this)
                };
            } else if (viewModel) {
                console.warn('ID not found for element:', this);
            } else {
                console.warn('ViewModel not found for element', this);
            }
        });
    }
    return object;
}

const basicMandateData = {
    'transaction-information': {
        regionId: '1',
        transactionTypeId: 1,
        successor: true,
        shortName: '1',
        longName: '1',
        campaignCode: '1',
        clientSegmentId: 1,
        subregionId: 1,
        clientTypeId: 1,
        mandateWinDate: '2016-01-01T00:00:00Z',
        proposedClosingDate: '2016-02-01T00:00:00Z',
        engageOpportunity: '1',
        retentiveClient: true,
        intermediary: '1',
        collateralId: 1,
        ndaIndicator: 'Y',
        privateIndicator: true,
        overview: '1',
        blackLinedVersusPrevious: true,
        nonDisclosureAgreementIndicator: true,
        imagingOnly: true,
        newPartyIndicator: null
    },
    billing: {
        isFeeScheduleAttached: true,
        isClosingInvoiceRequired: true,
        isFeeScheduleSigned: true,
        isFeeProposalApplicable: true,
        billingComment: 'This is a billing comment',
        feeProposalComment: 'This is a proposal comment',
        estimatedFirstYearRevenue: 300,
        documents: [
            {
                id: 103,
                fileName: 'Blargh.xlsx',
                description: 'now called description',
                fileId: 'rc4h6fD',
                type: 546,
                uploadedDate: '2016-09-12T09:48:31Z',
                uploadedBy: 'Jason F Buechele',
                commitId: 'XECCF6R',
                userRole: 'TMG'
            },
            {
                id: 107,
                fileName: 'NewExcel.xlsx',
                description: 'new excel document',
                fileId: 'sdfg4dj',
                type: 546,
                uploadedDate: '2016-09-12T12:50:08Z',
                uploadedBy: 'Jason F Buechele',
                commitId: 'XECCF6R',
                userRole: 'TMG'
            }
        ],
        transactionFees: [
            {
                id: 106,
                categoryCode: '04',
                currencyCode: 'BRL',
                amount: 5440
            }
        ]
    },
    'legal-entities': [
        {
            legalEntityId: 1,
            governingLawId: 9,
            legalRoles: [
                3,
                7
            ],
            id: 0
        },
        {
            legalEntityId: 1,
            governingLawId: 9,
            legalRoles: [
                2,
                3
            ],
            id: 1
        }
    ],
    comments: [
        {
            id: 5,
            dealId: '7',
            comment: "Mrs. Lovette's Meat Pie",
            commentTypeCode: 'MNDT_CMNT',
            commentDate: '2016-09-13T13:51:34Z',
            createdById: 'XECCF6R',
            createdByName: 'Bob C. Potle'
        },
        {
            id: 7,
            dealId: '7',
            comment: 'Keylime Pie',
            commentTypeCode: 'MNDT_CMNT',
            commentDate: '2016-09-13T13:51:34Z',
            createdById: 'XECCF6R',
            createdByName: 'Bob C. Potle'
        }
    ],
    'business-acceptance-information': {
        isFastTrack: true,
        committeeId: 1,
        proposedMeetingDate: '2015-12-31T05:00:00Z',
        proposedMeetingTime: '12:00 PM',
        projectName: 'Test Project',
        publicOfferingIndicator: 'Y',
        isLegalRiskConcerns: true,
        isSubjectToRegulation23A: true,
        revenueIndicator: 'B',
        revenueComments: 'Test Revenue Comments',
        extensionComments: 'Test Extension Comments',
        riskComments: 'Test Risk Comments',
        isExtension: true,
        isRisk: true,
        manualWorkaroundIndicator: 'Y',
        manualWorkaroundFurtherInfo: 'Test Manual Workaround Further Info',
        manualWorkaroundApprover: 'Bob Smith',
        manualWorkaroundDate: '2015-12-15T05:00:00Z',
        commercialPaperIssuanceIndicator: 'Y',
        isNewProductApproval: false,
        isBRCApprovedProduct: false,
        systematicallySignificantClientIndicator: 'N',
        regionId: 1
    },
    'deal-assignments': {
        regionId: 30
    }
};
export {
    basicMandateData,
    convertToDictionary,
    getElement,
    login,
    logout
};
export default {
    basicMandateData,
    convertToDictionary,
    getElement,
    login,
    logout
};