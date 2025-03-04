import moment from "moment";
import { DocumentCurrencyCode, ZATCAPaymentMethods } from "../types/currencyCodes.enum";
import { EGSUnitInfo } from "../types/EGSUnitInfo.interface";
import { ZATCAInvoiceProps } from "../types/invoice.interface";
import { IInvoiceType } from "../zatca/signing/generateCSR";

const currentDate = new Date();
const futureDate = moment(currentDate).add(5, "days");

const egs_info: EGSUnitInfo = {
    commonName: "Majd Al Khaleej Trading Est",
    organizationIdentifier: "300516966900003",
    organizationName: "Majd Al Khaleej Trading Est",
    organizationUnit: "MJ",
    country: "SA",
    invoiceType: IInvoiceType.Simplified,
    location: {
        street: "AI Madinah Almunawaruh",
        building: 7174,
        plot_identification: 2581,
        city_subdivision: "Al Fayha Dist",
        city: "RAS TANNURAH",
        postal_zone: 32817
    },
    businessCategory: "2066003018",
    egsSolutionName: "2066003018",
    egsModel: "2066003018",
    egsSerialNumber: "2066003018"
}

export const testInvoice: ZATCAInvoiceProps = {
    egs_info: egs_info,
    customerInfo: {
        NAT_number: "300000432310003",
        RegistrationName: "Saudi Arabian Oil Company",
        location: {
            Street: "Dhahran ",
            BuildingNumber: 1,
            PlotIdentification: 31311,
            CitySubdivisionName: "الظهران",
            CityName: "Dhahran",
            PostalZone: 31311
        }
    },
    payment_method: ZATCAPaymentMethods.BANK_ACCOUNT,
    conversion_rate: 3.75,
    invoice_counter_number: 24278,
    delivery_date: "2024-12-01",
    documentCurrencyCode: DocumentCurrencyCode.USD,
    invoice_level_note: "inv.Notes",
    invoice_serial_number: "24278",
    previous_invoice_hash: "739zhJpzCtii4PgUNGWGMpRnHl0KjtlohI8SSuU6Uko=",
    line_items: [
        {
            id: 1,
            name: "BOSS",
            unitCode: "Piece",
            notes: [
                "BOSS WELDING; 1/2 IN NPS OUTLET,51 MM (2 IN) OA LG,CL 6000, SCH160 SUPPLY,CS,38 MM (1-1/2 IN) OD OD,SOCKET WELD OUTLET,ASTM A105,ANSI B16.11,AD-036643-001,FOR HIGH TEMP SERVICE."
            ],
            quantity: 3,
            tax_exclusive_price: 9.14,
            discount: {
                amount: 0.0,
                reason: "No reason provided"
            },
            VAT_percent: 0.15
        }
    ],
    issue_date: moment(new Date()).format("YYYY-MM-DD"),
    issue_time: moment(new Date()).format("HH:mm:ss")
};

const tempTrivateKey = "LS0tLS1CRUdJTiBFQyBQUklWQVRFIEtFWS0tLS0tCk1IUUNBUUVFSUVqMnRSa0xPejFNc2VETSt2ZGJkZmE1WUdjYUJzYlBnVDJZUTkrb21lVjZvQWNHQlN1QkJBQUsKb1VRRFFnQUU2NGxFVlFIemJQeGw2YkVDSkx5TU9zRC9sdHM5Q0d1Skd1ZXF0MjBzVFAvcGVlcUNSMFZWbmpzdApRVzRzTzdLcGpPOElZTDNJV3dxSUJBRWxvcHdIOWc9PQotLS0tLUVORCBFQyBQUklWQVRFIEtFWS0tLS0t";
const tempCer = 'TUlJRkh6Q0NCTWFnQXdJQkFnSVRlQUFBVWdJQU02enpDK2pFOEFBQkFBQlNBakFLQmdncWhrak9QUVFEQWpCaU1SVXdFd1lLQ1pJbWlaUHlMR1FCR1JZRmJHOWpZV3d4RXpBUkJnb0praWFKay9Jc1pBRVpGZ05uYjNZeEZ6QVZCZ29Ka2lhSmsvSXNaQUVaRmdkbGVIUm5ZWHAwTVJzd0dRWURWUVFERXhKUVJWcEZTVTVXVDBsRFJWTkRRVFF0UTBFd0hoY05NalF4TURNeE1USXlNVE0xV2hjTk1qWXhNRE14TVRJek1UTTFXakJkTVFzd0NRWURWUVFHRXdKVFFURWxNQ01HQTFVRUNoTWNUV0ZxWkNCQmJDQkxhR0ZzWldWcUlGUnlZV1JwYm1jZ1JYTjBMakVVTUJJR0ExVUVDeE1MU0dWaFpDQlBabVpwWTJVeEVUQVBCZ05WQkFNVENFVkhVeTFOYWkweE1GWXdFQVlIS29aSXpqMENBUVlGSzRFRUFBb0RRZ0FFNjRsRVZRSHpiUHhsNmJFQ0pMeU1Pc0QvbHRzOUNHdUpHdWVxdDIwc1RQL3BlZXFDUjBWVm5qc3RRVzRzTzdLcGpPOElZTDNJV3dxSUJBRWxvcHdIOXFPQ0EyRXdnZ05kTUlITEJnTlZIUkVFZ2NNd2djQ2tnYjB3Z2JveFFqQkFCZ05WQkFRTU9URXRjMmx0ZFd4aGRHbHZibnd5TFVsUFUzd3pMVGxpT1dZNU5UWmpMV1EwWkdRdE5EZ3hOeTFoWTJNNUxUVTJORFpoTm1VMllqVmhNREVmTUIwR0NnbVNKb21UOGl4a0FRRU1Eek13TURVeE5qazJOamt3TURBd016RU5NQXNHQTFVRURBd0VNVEF3TURFeU1EQUdBMVVFR2d3cE56RTNOQ0JCU1NCTllXUnBibUZvSUVGc2JYVnVZWGRoY25Wb0xDQlNRVk1nVkVGT1RsVlNRVWd4RURBT0JnTlZCQThNQjFSU1FVUkpUa2N3SFFZRFZSME9CQllFRk55QUNOaGY5ak9hckNudmtHRkl4R29HZSs2U01COEdBMVVkSXdRWU1CYUFGTWZBNXJlcDNSTEtUejF0YUlLV0lVWHpBWFdrTUlIbEJnTlZIUjhFZ2Qwd2dkb3dnZGVnZ2RTZ2dkR0dnYzVzWkdGd09pOHZMME5PUFZCRldrVkpUbFpQU1VORlUwTkJOQzFEUVNneEtTeERUajFRVWxwRlNVNVdUMGxEUlZCTFNUUXNRMDQ5UTBSUUxFTk9QVkIxWW14cFl5VXlNRXRsZVNVeU1GTmxjblpwWTJWekxFTk9QVk5sY25acFkyVnpMRU5PUFVOdmJtWnBaM1Z5WVhScGIyNHNSRU05WlhoMGVtRjBZMkVzUkVNOVoyOTJMRVJEUFd4dlkyRnNQMk5sY25ScFptbGpZWFJsVW1WMmIyTmhkR2x2Ymt4cGMzUS9ZbUZ6WlQ5dlltcGxZM1JEYkdGemN6MWpVa3hFYVhOMGNtbGlkWFJwYjI1UWIybHVkRENCemdZSUt3WUJCUVVIQVFFRWdjRXdnYjR3Z2JzR0NDc0dBUVVGQnpBQ2hvR3ViR1JoY0Rvdkx5OURUajFRUlZwRlNVNVdUMGxEUlZORFFUUXRRMEVzUTA0OVFVbEJMRU5PUFZCMVlteHBZeVV5TUV0bGVTVXlNRk5sY25acFkyVnpMRU5PUFZObGNuWnBZMlZ6TEVOT1BVTnZibVpwWjNWeVlYUnBiMjRzUkVNOVpYaDBlbUYwWTJFc1JFTTlaMjkyTEVSRFBXeHZZMkZzUDJOQlEyVnlkR2xtYVdOaGRHVS9ZbUZ6WlQ5dlltcGxZM1JEYkdGemN6MWpaWEowYVdacFkyRjBhVzl1UVhWMGFHOXlhWFI1TUE0R0ExVWREd0VCL3dRRUF3SUhnREE4QmdrckJnRUVBWUkzRlFjRUx6QXRCaVVyQmdFRUFZSTNGUWlCaHFnZGhORDdFb2J0blNTSHp2c1owOEJWWm9HYzJDMkQ1Y1ZkQWdGa0FnRVFNQjBHQTFVZEpRUVdNQlFHQ0NzR0FRVUZCd01DQmdnckJnRUZCUWNEQXpBbkJna3JCZ0VFQVlJM0ZRb0VHakFZTUFvR0NDc0dBUVVGQndNQ01Bb0dDQ3NHQVFVRkJ3TURNQW9HQ0NxR1NNNDlCQU1DQTBjQU1FUUNJR0sxVU1JaUNDZTMwYWxaSWczT2pHK2Fhakh2VXREcEd4UjVHYzJyYWVuREFpQXdJSVlPdVJIWlUwL2VXTE9UaitsWmNjMVkxRE1UY1puLy9BSG5qZUxFbkE9PQ==';

export const productionData = {
    cirtifacaate: Buffer.from(tempCer, "base64").toString(),
    secret: "80r5s96JliAaVHL1wAz4+0g1vrmz21UAvEzWUwEXPjk=",
    privateKey: Buffer.from(tempTrivateKey, "base64").toString()
}