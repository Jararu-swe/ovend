/**
 * Vercel Domain Management Helper
 * 
 * Wraps the Vercel REST API for programmatic custom domain management.
 * Used to add, verify, and remove domains from the Vercel project.
 * 
 * Requires env vars:
 *   VERCEL_API_TOKEN - Vercel API token (create at https://vercel.com/account/tokens)
 *   VERCEL_PROJECT_ID - Vercel project ID (from project settings)
 *   VERCEL_TEAM_ID - Optional Vercel team ID (if using team account)
 */

const VERCEL_API_BASE = 'https://api.vercel.com';

function getHeaders() {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) {
    throw new Error('VERCEL_API_TOKEN is not set. Create one at https://vercel.com/account/tokens');
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

function getProjectQueryParams(): string {
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!projectId) {
    throw new Error('VERCEL_PROJECT_ID is not set. Find it in your Vercel project settings.');
  }
  const teamId = process.env.VERCEL_TEAM_ID;
  const params = new URLSearchParams({ projectId });
  if (teamId) {
    params.set('teamId', teamId);
  }
  return params.toString();
}

async function vercelFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let errorMessage: string;
    try {
      const errorJson = JSON.parse(errorBody);
      errorMessage = errorJson.error?.message || errorJson.message || errorBody;
    } catch {
      errorMessage = errorBody;
    }
    throw new Error(`Vercel API error (${response.status}): ${errorMessage}`);
  }

  return response.json();
}

/**
 * Adds a custom domain to the Vercel project.
 * 
 * @param domain - The domain to add (e.g. mybrand.com)
 * @returns The Vercel domain response with id and verification status
 */
export async function addDomainToVercel(domain: string): Promise<{
  id: string;
  name: string;
  verified: boolean;
  verification: Array<{ type: string; domain: string; value: string; reason: string }>;
}> {
  const params = getProjectQueryParams();
  const result = await vercelFetch<any>(
    `${VERCEL_API_BASE}/v10/projects/addDomain?${params}`,
    {
      method: 'POST',
      body: JSON.stringify({ name: domain }),
    }
  );
  return result;
}

/**
 * Checks the verification status of a domain on Vercel.
 * 
 * @param domain - The domain to check
 * @returns The domain details including verification status
 */
export async function getDomainStatusFromVercel(domain: string): Promise<{
  name: string;
  verified: boolean;
  verification: Array<{ type: string; domain: string; value: string; reason: string }>;
}> {
  const params = getProjectQueryParams();
  const result = await vercelFetch<any>(
    `${VERCEL_API_BASE}/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domain}?${params}`
  );
  return result;
}

/**
 * Triggers re-verification of a domain on Vercel.
 * 
 * @param domain - The domain to verify
 * @returns The verification result
 */
export async function verifyDomainOnVercel(domain: string): Promise<{
  name: string;
  verified: boolean;
  verification: Array<{ type: string; domain: string; value: string; reason: string }>;
}> {
  const params = getProjectQueryParams();
  const result = await vercelFetch<any>(
    `${VERCEL_API_BASE}/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domain}/verify?${params}`,
    { method: 'POST' }
  );
  return result;
}

/**
 * Removes a custom domain from the Vercel project.
 * 
 * @param domain - The domain to remove
 */
export async function removeDomainFromVercel(domain: string): Promise<void> {
  const params = getProjectQueryParams();
  await vercelFetch(
    `${VERCEL_API_BASE}/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domain}?${params}`,
    { method: 'DELETE' }
  );
}

/**
 * Generates DNS instructions for the vendor based on verification data.
 * 
 * @param domain - The custom domain
 * @param verificationRecords - The verification records from Vercel
 * @returns Human-readable DNS setup instructions
 */
export function generateDNSInstructions(
  domain: string,
  verificationRecords: Array<{ type: string; domain: string; value: string; reason: string }>
): {
  txtRecord: { name: string; value: string } | null;
  cnameRecord: { name: string; value: string } | null;
  instructions: string[];
} {
  let txtRecord: { name: string; value: string } | null = null;
  let cnameRecord: { name: string; value: string } | null = null;

  for (const record of verificationRecords || []) {
    if (record.type === 'TXT') {
      txtRecord = { name: record.domain, value: record.value };
    } else if (record.type === 'CNAME') {
      cnameRecord = { name: record.domain, value: record.value };
    }
  }

  const instructions: string[] = [];

  if (cnameRecord) {
    instructions.push(
      `1. Add a CNAME record for "${cnameRecord.name}" pointing to "${cnameRecord.value}"`
    );
    instructions.push(
      `   This routes your domain to your Vendle storefront.`
    );
  }

  if (txtRecord) {
    instructions.push(
      `2. Add a TXT record for "${txtRecord.name}" with value "${txtRecord.value}"`
    );
    instructions.push(
      `   This verifies you own the domain.`
    );
  }

  if (!cnameRecord && !txtRecord) {
    instructions.push(
      `Set up your domain's nameservers to point to Vercel for automatic configuration.`
    );
  }

  instructions.push(
    `3. DNS changes can take up to 48 hours to propagate, but usually take a few minutes.`
  );
  instructions.push(
    `4. Once propagation is complete, click "Verify Domain" below to confirm.`
  );

  return { txtRecord, cnameRecord, instructions };
}
