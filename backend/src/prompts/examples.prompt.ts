export function examplesPrompt(): string {
  return `## Examples

### Example 1: Standard CRM export

Input Headers: Customer Name, Email Address, Phone Number, Company, Lead Source, Notes
Row 1: "Sarah Johnson", "sarah@techcorp.com", "+1-415-555-0132", "TechCorp Inc", "Facebook Leads", "Interested in enterprise plan"
Row 2: "", "", "", "", "", ""

Output:
{
  "columnMappings": {
    "Customer Name": "name",
    "Email Address": "email",
    "Phone Number": "phone",
    "Company": "company",
    "Lead Source": "data_source",
    "Notes": "crm_note"
  },
  "records": [
    {
      "created_at": "",
      "name": "Sarah Johnson",
      "email": "sarah@techcorp.com",
      "country_code": "+1",
      "mobile_without_country_code": "4155550132",
      "company": "TechCorp Inc",
      "city": "",
      "state": "",
      "country": "",
      "lead_owner": "",
      "crm_status": "GOOD_LEAD_FOLLOW_UP",
      "crm_note": "Interested in enterprise plan",
      "data_source": "Facebook Leads",
      "possession_time": "",
      "description": ""
    }
  ],
  "skipped": [
    {
      "originalRow": ["", "", "", "", "", ""],
      "reason": "Row contains no usable data — all fields empty",
      "preview": {}
    }
  ]
}

### Example 2: Google Ads export with different column names

Input Headers: Lead Created, Full Name, Primary Email, Mobile, Business Name, City, Country, Campaign
Row 1: "2024-03-15", "Michael Chen", "mchen@innovate.io", "+82-10-5555-1234", "InnovateAI", "Seoul", "South Korea", "Brand Awareness Q1"
Row 2: "2024-03-14", "Emma Wilson", "not-an-email", "N/A", "Global Corp", "", "UK", "Retargeting"

Output:
{
  "columnMappings": {
    "Lead Created": "created_at",
    "Full Name": "name",
    "Primary Email": "email",
    "Mobile": "mobile_without_country_code",
    "Business Name": "company",
    "City": "city",
    "Country": "country",
    "Campaign": "data_source"
  },
  "records": [
    {
      "created_at": "2024-03-15",
      "name": "Michael Chen",
      "email": "mchen@innovate.io",
      "country_code": "+82",
      "mobile_without_country_code": "1055551234",
      "company": "InnovateAI",
      "city": "Seoul",
      "state": "",
      "country": "South Korea",
      "lead_owner": "",
      "crm_status": "GOOD_LEAD_FOLLOW_UP",
      "crm_note": "",
      "data_source": "Google Ads",
      "possession_time": "",
      "description": ""
    },
    {
      "created_at": "2024-03-14",
      "name": "Emma Wilson",
      "email": "",
      "country_code": "",
      "mobile_without_country_code": "",
      "company": "Global Corp",
      "city": "",
      "state": "",
      "country": "UK",
      "lead_owner": "",
      "crm_status": "DID_NOT_CONNECT",
      "crm_note": "",
      "data_source": "Google Ads",
      "possession_time": "",
      "description": ""
    }
  ],
  "skipped": []
}`;
}
