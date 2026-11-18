// Tech category (step 25): subnetting, checksum/format validation, and client-side security tools.
// See mdFiles/steps/25-tech-category.md.
import type { CalculatorConfig } from './types.ts';

// --- ip-subnet-calculator helpers -------------------------------------------------------------
// Pure arithmetic only (no bitwise operators): JS's `<<`/`>>>` operate on 32-bit *signed* ints and
// misbehave at the top of the IPv4 range (e.g. a /0 block's size, 2^32, overflows a 32-bit shift).
// Every value here stays a plain double well under Number.MAX_SAFE_INTEGER (2^53), so this is exact.
function ipToInt(o1: number, o2: number, o3: number, o4: number) {
  return o1 * 16777216 + o2 * 65536 + o3 * 256 + o4;
}

// One subnet's full set of derived figures, in SI-style "32-bit integer" units — the breakdown's
// own `ipAddress` format (lib/breakdown.ts) converts each one to dotted-decimal at display time.
function subnetOf(o1: number, o2: number, o3: number, o4: number, prefix: number) {
  const octetsValid = [o1, o2, o3, o4].every((o) => Number.isInteger(o) && o >= 0 && o <= 255);
  if (!octetsValid || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    return {
      networkAddress: NaN, broadcastAddress: NaN, subnetMask: NaN,
      firstHostAddress: NaN, lastHostAddress: NaN, totalAddresses: NaN, usableHosts: NaN
    };
  }
  const ipInt = ipToInt(o1, o2, o3, o4);
  const blockSize = 2 ** (32 - prefix);
  const networkAddress = Math.floor(ipInt / blockSize) * blockSize;
  const broadcastAddress = networkAddress + blockSize - 1;
  const subnetMask = 2 ** 32 - 1 - (blockSize - 1);
  let usableHosts: number, firstHostAddress: number, lastHostAddress: number;
  if (prefix === 32) {
    // A /32 is a host route: the one address IS the host, no network/broadcast distinction.
    usableHosts = 1;
    firstHostAddress = networkAddress;
    lastHostAddress = networkAddress;
  } else if (prefix === 31) {
    // RFC 3021: a point-to-point /31 uses both addresses as hosts, with no broadcast address.
    usableHosts = 2;
    firstHostAddress = networkAddress;
    lastHostAddress = broadcastAddress;
  } else {
    usableHosts = blockSize - 2;
    firstHostAddress = networkAddress + 1;
    lastHostAddress = broadcastAddress - 1;
  }
  return { networkAddress, broadcastAddress, subnetMask, firstHostAddress, lastHostAddress, totalAddresses: blockSize, usableHosts };
}

function formatIpInt(v: number) {
  const o1 = Math.floor(v / 16777216) % 256;
  const o2 = Math.floor(v / 65536) % 256;
  const o3 = Math.floor(v / 256) % 256;
  const o4 = v % 256;
  return `${o1}.${o2}.${o3}.${o4}`;
}

// Common prefixes for the reference table — the mask is folded into the row label (dotted-decimal
// isn't a ReferenceTableSection number cell), `values` carries the two numeric columns.
function commonPrefixRows() {
  return [24, 25, 26, 27, 28, 29, 30].map((prefix) => {
    const { subnetMask, totalAddresses, usableHosts } = subnetOf(0, 0, 0, 0, prefix);
    return { label: `/${prefix} (${formatIpInt(subnetMask)})`, values: [totalAddresses, usableHosts] };
  });
}

export const techCalculators: CalculatorConfig[] = [
  {
    id: 'ip-subnet-calculator',
    category: 'tech',
    group: 'Everyday Tech Tools',
    glyph: 'CIDR',
    updatedAt: '2026-11-18',
    aliases: ['subnet mask calculator', 'cidr calculator', 'network address calculator', 'ip range calculator', 'broadcast address calculator'],
    related: ['iban-calculator', 'password-strength-checker', 'data-storage-converter'],
    title: 'IP Subnet Calculator (CIDR)',
    description: 'Find the network address, broadcast address, usable host range, and total/usable host counts for an IPv4 address and subnet mask or CIDR prefix, using the real CIDR math from RFC 4632.',
    example: 'A /24 network like 192.168.1.10/24 has network address 192.168.1.0, broadcast address 192.168.1.255, and 254 usable host addresses from 192.168.1.1 to 192.168.1.254.',
    inputs: [
      { id: 'ipOctet1', label: 'IP address — 1st octet', type: 'number', placeholder: '10', defaultValue: 10, step: 1, min: 0 },
      { id: 'ipOctet2', label: 'IP address — 2nd octet', type: 'number', placeholder: '20', defaultValue: 20, step: 1, min: 0 },
      { id: 'ipOctet3', label: 'IP address — 3rd octet', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 0 },
      { id: 'ipOctet4', label: 'IP address — 4th octet', type: 'number', placeholder: '40', defaultValue: 40, step: 1, min: 0 },
      { id: 'prefixLength', label: 'Subnet prefix length (CIDR, /0–/32)', type: 'number', placeholder: '20', defaultValue: 20, step: 1, min: 0 }
    ],
    breakdown: {
      headline: 'networkAddress',
      headlineLabel: 'Network address',
      outputs: [
        { id: 'networkAddress', label: 'Network address', format: 'ipAddress' },
        { id: 'broadcastAddress', label: 'Broadcast address', format: 'ipAddress' },
        { id: 'subnetMask', label: 'Subnet mask', format: 'ipAddress' },
        { id: 'firstHostAddress', label: 'First usable host', format: 'ipAddress' },
        { id: 'lastHostAddress', label: 'Last usable host', format: 'ipAddress' },
        { id: 'totalAddresses', label: 'Total addresses in block', format: 'integer' },
        { id: 'usableHosts', label: 'Usable host addresses', format: 'integer' }
      ],
      groups: [
        { title: 'IP address', inputs: ['ipOctet1', 'ipOctet2', 'ipOctet3', 'ipOctet4'] },
        { title: 'Subnet', inputs: ['prefixLength'] }
      ],
      derive(values) {
        return { reservedCount: values.totalAddresses - values.usableHosts };
      },
      visual: {
        type: 'donut',
        segments: [
          { from: 'usableHosts', label: 'Usable hosts' },
          { from: 'reservedCount', label: 'Network + broadcast (reserved)' }
        ],
        center: 'totalAddresses',
        centerSub: 'Total addresses in block'
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What CIDR subnetting actually computes',
        paragraphs: [
          'Every IPv4 address is a 32-bit number, conventionally written as four 8-bit "octets" (0–255) separated by dots. Classless Inter-Domain Routing (CIDR), defined in RFC 4632, splits those 32 bits into a network portion and a host portion at a chosen bit position — the "prefix length," written after a slash. RFC 4632 gives the example that "the legacy \'Class B\' network 172.16.0.0, with an implied network mask of 255.255.0.0, is defined as the prefix 172.16.0.0/16," where the /16 "indicates that the mask to extract the network portion of the prefix is a 32-bit value where the most significant 16 bits are ones and the least significant 16 bits are zeros."',
          'Once the prefix length fixes how many bits are "network" bits, everything else follows mechanically. Setting every remaining host bit to 0 gives the network address (the subnet\'s own identifier, never assigned to a device); setting every host bit to 1 gives the broadcast address (used to reach every device on that subnet at once). Every address in between is a usable host address.',
          'Two prefix lengths break that general pattern. RFC 3021 carved out an exception for /31: because a point-to-point link "can only possibly have two identifying endpoints and don\'t support the notion of broadcast," both addresses in a /31 pair are usable hosts, with no separate network or broadcast address. A /32 is narrower still — RFC 4632\'s own reference table labels it a "host route": a single address with no room for any other address at all.',
          'This calculator runs that exact bit math on whatever IPv4 address and prefix you enter. It does not detect, look up, or report your own public IP address — it only performs the subnetting arithmetic on the address you type in.'
        ]
      },
      howTo: {
        intro: 'Enter any IPv4 address inside the subnet, plus its CIDR prefix length.',
        steps: [
          { name: 'Enter the IP address', text: 'Type each of the four octets (0–255) — any address inside the subnet works, not just the network address itself.' },
          { name: 'Enter the prefix length', text: 'The CIDR number after the slash (0–32), e.g. 24 for a /24 network.' },
          { name: 'Read the network and broadcast addresses', text: 'The subnet\'s first address (network) and last address (broadcast) — see the watch-outs for the /31 and /32 exceptions.' },
          { name: 'Read the usable host range and counts', text: 'The first and last addresses devices can actually use, plus the total addresses in the block and how many of them are usable hosts.' }
        ],
        outro: 'Everything is calculated in your browser as you type. Nothing you enter is sent or stored.'
      },
      formula: {
        intro: 'The subnet mask, network address and broadcast address all fall out of the prefix length — the number of leading bits reserved for the network portion of the address.',
        expression:
          'blockSize = 2^(32 − prefix)\nnetworkAddress = floor(ipAddress ÷ blockSize) × blockSize\nbroadcastAddress = networkAddress + blockSize − 1\nusableHosts = blockSize − 2 (prefix ≤ 30)',
        terms: [
          { symbol: 'ipAddress', meaning: 'The 32-bit integer value of the four entered octets: octet1×2^24 + octet2×2^16 + octet3×2^8 + octet4.' },
          { symbol: 'prefix', meaning: 'The CIDR prefix length (0–32): how many leading bits of the address are the network portion.' },
          { symbol: 'blockSize', meaning: 'How many addresses the subnet contains — one for every possible combination of the remaining host bits.' }
        ],
        note: 'A /31 (RFC 3021, point-to-point links) uses both addresses as hosts instead of reserving one for broadcast, and a /32 is a single-address "host route" — both are handled as the named exceptions above, not by the general blockSize−2 rule.'
      },
      workedExample: {
        intro: 'What does 192.168.1.10/24 — a classic home/office network — break down into?',
        rows: [
          { label: 'IP address as a 32-bit integer', value: '192×2^24 + 168×2^16 + 1×2^8 + 10 = 3,232,235,786' },
          { label: 'Block size for /24', value: '2^(32−24) = 2^8 = 256 addresses' },
          { label: 'Network address', value: 'floor(3,232,235,786 ÷ 256) × 256 = 3,232,235,776 → 192.168.1.0' },
          { label: 'Broadcast address', value: '3,232,235,776 + 256 − 1 = 3,232,236,031 → 192.168.1.255' },
          { label: 'Usable hosts', value: '256 − 2 = 254, from 192.168.1.1 to 192.168.1.254' }
        ],
        result: 'Network 192.168.1.0, broadcast 192.168.1.255, 254 usable hosts (192.168.1.1–192.168.1.254).',
        explanation: 'The host portion is the last 8 bits (32−24). Zeroing those 8 bits gives the network address; setting all 8 to 1 gives the broadcast address. Every one of the 256 addresses in between those two endpoints, except the two endpoints themselves, is a usable host — matching RFC 4632\'s own reference table, which lists 256 "addrs/block" for a /24.'
      },
      watchOut: [
        { title: 'This does not look up your own IP address', body: 'This calculator only runs the subnetting math on whatever address and prefix you type — it cannot detect, report, or look up your device\'s own public or private IP address. These pages are static and have no access to your connection.' },
        { title: 'A /31 has no broadcast address', body: 'RFC 3021 specifically allows a /31 point-to-point link to use both of its two addresses as hosts, since a two-endpoint link has no use for a broadcast address. Treat both addresses this calculator shows for a /31 as usable, not as network+host.' },
        { title: 'A /32 is a single host, not a subnet', body: 'A /32 has exactly one address, RFC 4632\'s table calls it a "host route" — there is no separate network or broadcast address to report, and no other address in the "block."' },
        { title: 'Enter any address inside the subnet, not necessarily the network address', body: 'You can type any host\'s IP address with the subnet\'s prefix length — this calculator derives the network address for you. It does not require you to already know the network address before using it.' },
        { title: 'An out-of-range octet or prefix has no answer', body: 'Each octet must be a whole number 0–255 and the prefix a whole number 0–32; this calculator returns no result for anything outside that range rather than guessing.' }
      ],
      references: [
        { label: 'RFC 4632 (IETF), Classless Inter-domain Routing (CIDR): The Internet Address Assignment and Aggregation Plan', url: 'https://www.rfc-editor.org/rfc/rfc4632.html' },
        { label: 'RFC 3021 (IETF), Using 31-Bit Prefixes on IPv4 Point-to-Point Links', url: 'https://www.rfc-editor.org/rfc/rfc3021.html' }
      ],
      referenceTable: {
        title: 'Common subnet sizes',
        columns: ['Prefix (subnet mask)', 'Total addresses', 'Usable hosts'],
        rows: commonPrefixRows(),
        decimals: 0,
        note: 'Usable hosts follows the general blockSize−2 rule above (every prefix shown here is ≤ /30); the /31 and /32 exceptions are covered separately in the watch-outs.'
      }
    },
    seo: {
      title: 'IP Subnet Calculator (CIDR) – Network & Host Range',
      description: 'Free IP subnet calculator: enter an IPv4 address and CIDR prefix to get the network address, broadcast address, usable host range, and host counts.',
      faq: [
        { question: 'What is the network address for 192.168.1.10/24?', answer: '192.168.1.0. A /24 reserves the last 8 bits for hosts, so zeroing those bits on 192.168.1.10 gives 192.168.1.0.' },
        { question: 'How many usable hosts does a /24 have?', answer: '254. A /24 contains 2^(32−24) = 256 total addresses; subtracting the network address and the broadcast address leaves 254 usable hosts, from .1 to .254.' },
        { question: 'How do you calculate a broadcast address?', answer: 'Take the network address and set every host bit to 1 — equivalently, networkAddress + blockSize − 1, where blockSize is 2^(32 − prefix). For 192.168.1.0/24, that is 192.168.1.0 + 256 − 1 = 192.168.1.255.' },
        { question: 'What is different about a /31 subnet?', answer: 'RFC 3021 lets a /31 point-to-point link use both of its two addresses as hosts, since a two-endpoint link has no use for a broadcast address — there is no separate network or broadcast address on a /31.' },
        { question: 'What is a /32 used for?', answer: 'A /32 identifies exactly one address — RFC 4632\'s own reference table calls it a "host route." It has no network, broadcast, or additional host addresses.' },
        { question: 'Does a CIDR prefix tell you the subnet mask?', answer: 'Yes — a /24 is the mask 255.255.255.0, a /16 is 255.255.0.0, and so on: the prefix number is simply how many leading mask bits are set to 1.' },
        { question: 'Can I enter any IP address in the subnet, or does it have to be the network address?', answer: 'Any address inside the subnet works. This calculator floors whatever address you enter down to its subnet\'s network address automatically.' },
        { question: 'Does this tool look up my own IP address?', answer: 'No. It only performs the subnetting calculation on the address and prefix you type in; it has no access to your device\'s real IP address.' }
      ]
    },
    compute(values) {
      const result = subnetOf(values.ipOctet1, values.ipOctet2, values.ipOctet3, values.ipOctet4, values.prefixLength);
      return { ...result };
    }
  },
  // Custom-component stub: rendered by components/IbanCalculator.tsx (see
  // app/[locale]/calculators/[slug]/page.tsx). IBAN check digits need the full ISO 7064 MOD 97-10
  // remainder over the whole string; a 34-character IBAN expands past 70 digits once every letter
  // becomes two, far beyond a JS-safe integer — this needs free text, not numeric CalculatorInput
  // fields (which would also silently drop a BBAN's significant leading zeros).
  {
    id: 'iban-calculator',
    category: 'tech',
    group: 'Everyday Tech Tools',
    glyph: 'IBAN',
    updatedAt: '2026-11-18',
    aliases: ['iban validator', 'iban check digit calculator', 'iban checksum calculator', 'validate iban number', 'generate iban check digits'],
    related: ['ip-subnet-calculator', 'password-strength-checker', 'data-storage-converter'],
    title: 'IBAN Calculator (Validate or Generate Check Digits)',
    description: 'Check whether an IBAN\'s format and check digits are internally consistent, or generate the two check digits for a country code and BBAN, using the real ISO 7064 MOD 97-10 algorithm. A format/checksum check only — not a bank account lookup.',
    example: 'The IBAN GB82 WEST 1234 5698 7654 32 passes the ISO 7064 MOD 97-10 check: rearranged and converted to digits, the number leaves a remainder of exactly 1 when divided by 97.',
    inputs: [],
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What an IBAN check digit actually proves',
        paragraphs: [
          'An International Bank Account Number (IBAN) is built from a 2-letter country code, 2 check digits, and a country-specific Basic Bank Account Number (BBAN) that carries the actual bank code, branch code and account number — iban.com\'s own structure reference shows, for example, Germany\'s DE75512108001245126199 splitting into country code "DE," check digits "75," and the remaining BBAN. Every IBAN-issuing country\'s BBAN format is registered with SWIFT/the IBAN registry, but the two check digits are always computed the same way everywhere, by the ISO 7064 standard\'s "MOD 97-10" algorithm.',
          'Wikipedia\'s "International Bank Account Number" article describes the check exactly: "An IBAN is validated by converting it into an integer and performing a basic mod-97 operation on it. If the IBAN is valid, the remainder equals 1." To do that, you "move the four initial characters to the end of the string," "replace each letter in the string with two digits...where A = 10, B = 11, ..., Z = 35," and then "interpret the string as a decimal integer and compute the remainder of that number on division by 97."',
          'That check digit is a pure arithmetic consistency test — it confirms the digits weren\'t mistyped or transposed, nothing more. It cannot confirm the bank, branch or account number actually exists, or that the account belongs to anyone: this calculator has no connection to any bank, and scopes itself strictly to the format/checksum math.'
        ]
      },
      howTo: {
        intro: 'Switch between validating an existing IBAN and generating check digits for a new one.',
        steps: [
          { name: 'Pick a mode', text: '"Validate an IBAN" checks a full IBAN you already have; "Generate check digits" computes the 2 check digits for a country code and BBAN you provide.' },
          { name: 'To validate, paste the IBAN', text: 'Spaces are ignored and letters are treated case-insensitively, same as how IBANs are normally printed in groups of 4.' },
          { name: 'Read the result', text: 'A valid IBAN shows the MOD-97 remainder equal to 1; anything else, or a format problem (wrong length or characters), is reported as invalid.' },
          { name: 'To generate, enter a country code and BBAN', text: 'The 2-letter country code and the rest of the account identifier (without check digits) — the calculator computes the 2 check digits that make the whole IBAN pass its own MOD-97 test.' }
        ],
        outro: 'Everything runs in your browser as you type. Nothing you enter is sent to a server or stored anywhere.'
      },
      formula: {
        intro: 'ISO 7064\'s MOD 97-10 check, applied exactly as Wikipedia\'s IBAN article describes it.',
        expression:
          'rearranged = IBAN[5:] + IBAN[1:4]   (move the first 4 characters to the end)\nnumeric = rearranged, each letter replaced by two digits: A=10, B=11, ..., Z=35\nremainder = numeric mod 97\nvalid when remainder = 1\nTo generate: set the check digits to "00", compute remainder the same way, checkDigits = 98 − remainder',
        terms: [
          { symbol: 'IBAN[5:] + IBAN[1:4]', meaning: 'The IBAN with its first 4 characters (country code + check digits) moved to the end — 1-indexed, matching how the standard describes the rearrangement.' },
          { symbol: 'A=10 ... Z=35', meaning: 'Every letter is replaced by a two-digit number so the whole string can be read as one long decimal integer.' },
          { symbol: 'mod 97', meaning: 'The remainder when that long integer is divided by 97 — accumulated one digit at a time (remainder = (remainder × base + digit) mod 97) rather than ever forming the full number, which keeps the arithmetic exact even for the longest, 34-character IBANs.' }
        ],
        note: 'Generating check digits uses the same remainder calculation with the two check-digit positions temporarily set to "00," then subtracts the result from 98 (padding to 2 digits if needed).'
      },
      workedExample: {
        intro: 'Check Wikipedia\'s own example IBAN: GB82 WEST 1234 5698 7654 32.',
        rows: [
          { label: 'IBAN, spaces removed', value: 'GB82WEST12345698765432' },
          { label: 'Rearranged (first 4 chars moved to the end)', value: 'WEST12345698765432GB82' },
          { label: 'Letters replaced with digits (W=32, E=14, S=28, T=29, G=16, B=11)', value: '3214282912345698765432161182' },
          { label: 'That number mod 97', value: '1' }
        ],
        result: 'Remainder 1 → the check digits are valid.',
        explanation: 'Because the rearranged, letter-substituted number leaves a remainder of exactly 1 when divided by 97, this IBAN passes the ISO 7064 check — confirming only that its digits are internally consistent, not that the WEST branch or the account number are real.'
      },
      watchOut: [
        { title: 'This is a format/checksum check, not a bank lookup', body: 'A valid result means the digits are internally consistent under ISO 7064 — it does not mean the bank, branch or account number exists, or that the account belongs to anyone. This site has no access to any bank\'s account data.' },
        { title: 'A passing checksum does not confirm the BBAN\'s own structure', body: 'Each country registers its own BBAN length and layout with the IBAN registry; this calculator checks the universal MOD 97-10 check digits only; it does not hold every country\'s own BBAN length/format rules, so a wrong-length BBAN for a given country could still happen to pass this check if it is not actually a real account.' },
        { title: 'Case and spacing are normalized, but typos inside the BBAN are not caught by magic', body: 'The checksum catches most single-character typos and swapped-adjacent-digit transpositions (this is exactly what a check digit is designed to catch), but it cannot catch every possible error — two different wrong digits can occasionally still produce a remainder of 1.' },
        { title: 'Nothing typed here is sent anywhere', body: 'Validation and generation both run entirely in your browser. No IBAN, country code or BBAN you type is transmitted to a server or stored.' }
      ],
      references: [
        { label: 'Wikipedia, International Bank Account Number (MOD-97-10 validation/generation algorithm and worked example)', url: 'https://en.wikipedia.org/wiki/International_Bank_Account_Number' },
        { label: 'Wikipedia, ISO/IEC 7064 (check-digit standard used by the IBAN)', url: 'https://en.wikipedia.org/wiki/ISO_7064' },
        { label: 'IBAN.com, IBAN structure (country code, check digits, BBAN)', url: 'https://www.iban.com/structure' }
      ]
    },
    seo: {
      title: 'IBAN Calculator – Validate or Generate Check Digits',
      description: 'Free IBAN calculator: validate an IBAN\'s format and ISO 7064 check digits, or generate check digits from a country code and BBAN. Format check only.',
      faq: [
        { question: 'How do you validate an IBAN check digit?', answer: 'Move the first 4 characters (country code + check digits) to the end, replace every letter with two digits (A=10...Z=35), then divide the resulting number by 97. A valid IBAN leaves a remainder of exactly 1.' },
        { question: 'Is GB82 WEST 1234 5698 7654 32 a valid IBAN?', answer: 'Yes, by the checksum: rearranged and converted to a number, it leaves a remainder of 1 when divided by 97 — this is the standard worked example from Wikipedia\'s IBAN article.' },
        { question: 'Does a valid IBAN checksum mean the account is real?', answer: 'No. It only means the digits are internally consistent under ISO 7064\'s MOD 97-10 rule — this calculator has no access to any bank\'s account data and cannot confirm an account exists or belongs to anyone.' },
        { question: 'How are IBAN check digits generated?', answer: 'Set the two check-digit positions to "00," run the same rearrange-and-mod-97 calculation, then subtract the remainder from 98 (padding to two digits) — for GB82 WEST..., that calculation gives exactly 82.' },
        { question: 'What is a BBAN?', answer: 'The Basic Bank Account Number: everything in an IBAN after the country code and check digits — the actual bank code, branch code and account number, in whatever format that country has registered.' },
        { question: 'Why does this calculator take the whole IBAN as text instead of separate number fields?', answer: 'A long IBAN\'s digits, after the letter-to-number substitution, exceed what a JavaScript number (or this site\'s numeric input fields) can represent exactly, and splitting a BBAN into number fields would also drop significant leading zeros from bank/branch codes. Free text preserves every character exactly.' },
        { question: 'Is my IBAN sent anywhere when I use this tool?', answer: 'No. Validation and generation both run entirely in your browser; nothing you type is transmitted to a server or stored.' }
      ]
    },
    compute() { return {}; }
  },
  // Custom-component stub: rendered by components/PasswordStrengthChecker.tsx (see
  // app/[locale]/calculators/[slug]/page.tsx) — needs live text input, the same reason love-
  // calculator and the text-tools widgets are custom rather than solver/breakdown.
  {
    id: 'password-strength-checker',
    category: 'tech',
    group: 'Everyday Tech Tools',
    glyph: '***',
    updatedAt: '2026-11-18',
    aliases: ['password entropy calculator', 'how strong is my password', 'password strength estimator', 'password entropy checker'],
    related: ['iban-calculator', 'ip-subnet-calculator', 'character-counter'],
    title: 'Password Strength Checker (Entropy Estimator)',
    description: 'Estimate a typed password\'s entropy in bits from its length and which character types it uses, entirely in your browser. Covers NIST SP 800-63B\'s current length-over-complexity guidance honestly — nothing you type is ever sent or stored.',
    example: 'The 25-character lowercase passphrase "correcthorsebatterystaple" scores about 117.5 bits of entropy, well above the 11-character mixed-case password "Tr0ub4dor&3" at about 72.3 bits — length beats added complexity here by over 45 bits.',
    inputs: [],
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What this entropy estimate measures — and what it does not',
        paragraphs: [
          'Wikipedia\'s "Password strength" article gives the standard formula for a password\'s entropy in bits: "H = log₂(N^L) = L × log₂(N)," where N is the size of the character set a password is drawn from and L is its length. The same article notes what that number means practically: "a password with 42 bits of entropy would require 2^42 (4,398,046,511,104) attempts to exhaust all possibilities during a brute force search" — bigger N or longer L both mean more attempts, but the formula multiplies by length while only taking the logarithm of the character-set size, so length has outsized leverage.',
          'This calculator checks which of four character categories a typed password actually uses — lowercase letters (26), uppercase letters (26), digits (10), and the standard 33 printable ASCII symbols including the space character — adds up whichever ones are present into N, and multiplies by the password\'s length. That assumes a brute-force attacker guessing uniformly at random across the full character set; it says nothing about whether the specific password is a dictionary word, a keyboard pattern, or a known breached password, which real attackers try first, long before brute force.',
          'NIST SP 800-63B — the current U.S. federal digital-identity guideline — deliberately does not score passwords by entropy at all. It requires memorized secrets to be "at least 8 characters in length if chosen by the subscriber," recommends verifiers "permit subscriber-chosen memorized secrets at least 64 characters in length," and states plainly: "No other complexity requirements for memorized secrets SHOULD be imposed," adding that verifiers "SHOULD NOT impose other composition rules (e.g., requiring mixtures of different character types...) for memorized secrets." It also recommends against forced periodic changes. In short: current expert guidance favors length and checking against known-breached passwords over forcing symbols and digits — this page\'s entropy estimate should be read in that light, not as "more symbol types always wins."'
        ]
      },
      howTo: {
        intro: 'Type a password to see its estimated entropy update instantly.',
        steps: [
          { name: 'Type a password', text: 'Use "Show" to reveal it while you type, or leave it masked.' },
          { name: 'Read the character types detected', text: 'Lowercase, uppercase, digits and symbols each add their own share to the character-set size — only the types actually present count.' },
          { name: 'Read the entropy in bits', text: 'Length × log2(character-set size) — the higher, the more brute-force attempts the password would theoretically take to exhaust.' },
          { name: 'Compare, don\'t just chase symbols', text: 'Try a longer, simpler password alongside a shorter, complex one — length usually wins, matching NIST\'s current guidance below.' }
        ],
        outro: 'Everything above runs in your browser as you type. Nothing is ever sent to a server, logged, or stored — see the watch-outs below.'
      },
      formula: {
        intro: 'The classic Shannon-style password entropy formula.',
        expression: 'N = sum of the character-set sizes actually used (lowercase 26, uppercase 26, digits 10, symbols 33)\nH = L × log2(N)',
        terms: [
          { symbol: 'L', meaning: 'The password\'s length, in characters.' },
          { symbol: 'N', meaning: 'The size of the character set the password draws from — only the categories actually present in the password count toward it.' },
          { symbol: 'H', meaning: 'Entropy in bits: the base-2 logarithm of how many possible passwords share that same length and character-set choice, i.e. log2(N^L).' }
        ],
        note: 'This assumes every character is chosen uniformly at random from the active set. A predictable password (a dictionary word, a name, a keyboard pattern, a known breached password) has far less real-world unpredictability than this formula credits it with — this calculator has no dictionary or breach database to check against.'
      },
      workedExample: {
        intro: 'Does adding symbols beat adding length? Compare a 25-character lowercase-only passphrase to an 11-character mixed-case one.',
        rows: [
          { label: '"correcthorsebatterystaple"', value: 'Length 25, lowercase only → character-set size 26 → entropy = 25 × log2(26) ≈ 117.5 bits' },
          { label: '"Tr0ub4dor&3"', value: 'Length 11, uses lowercase + uppercase + digits + a symbol → character-set size 95 → entropy = 11 × log2(95) ≈ 72.3 bits' }
        ],
        result: 'The 25-character lowercase-only passphrase scores about 45.2 bits higher than the 11-character mixed-case password.',
        explanation: 'Entropy multiplies by length but only takes a logarithm of the character-set size, so stretching a password from 11 to 25 characters outweighs quadrupling its character-set size from 26 to 95 — the same principle behind NIST SP 800-63B\'s shift toward encouraging length over forced complexity rules.'
      },
      watchOut: [
        { title: 'This cannot tell a random password from a guessable one', body: 'The formula assumes uniform random selection from the active character set. "aaaaaaaa" and a truly random 8-character lowercase password both score the same 37.6 bits here, even though a real attacker would try "aaaaaaaa" (and every dictionary word, and every previously breached password) long before brute-forcing the full character set. NIST SP 800-63B requires checking new passwords against breach/blocklist databases for exactly this reason — this static, client-side tool has no such database.' },
        { title: 'Characters outside the standard set still count toward length, not toward the character-set size', body: 'Non-Latin letters, accented characters, or emoji add to the password\'s length here but add nothing to the 95-character pool this calculator tracks, so a password mixing in those characters is likely stronger than this estimate shows — this is an underestimate in that direction, not an overestimate.' },
        { title: 'More symbol categories is not automatically "stronger"', body: 'This page\'s own worked example shows a 25-character lowercase-only passphrase scoring over 45 bits higher than an 11-character password using all four character types — length has more leverage on the entropy formula than adding another character category does.' },
        { title: 'Nothing typed here is sent, logged, or stored', body: 'The password field never leaves your browser: there is no network request, no analytics event and no server-side logging of anything you type into this calculator.' },
        { title: 'This is an estimate, not a password policy', body: 'It does not replace a real verifier\'s own length minimum, breach-database check, or rate-limiting — those are what actually stop most real-world password attacks, per NIST SP 800-63B.' }
      ],
      references: [
        { label: 'Wikipedia, Password strength (entropy formula H = L × log2(N))', url: 'https://en.wikipedia.org/wiki/Password_strength' },
        { label: 'NIST Special Publication 800-63B, Digital Identity Guidelines: Authentication and Lifecycle Management, §5.1.1 Memorized Secrets', url: 'https://pages.nist.gov/800-63-3/sp800-63b.html' }
      ]
    },
    seo: {
      title: 'Password Strength Checker – Entropy Estimator',
      description: 'Free password strength checker: estimates entropy in bits from length and character types, entirely in your browser. Nothing you type is sent or stored.',
      faq: [
        { question: 'How is password entropy calculated?', answer: 'H = L × log2(N): the password\'s length (L) multiplied by the base-2 logarithm of the character-set size (N) it draws from — lowercase letters (26), uppercase (26), digits (10) and symbols (33), summing whichever types are actually present.' },
        { question: 'Is a longer password always stronger than a more complex one?', answer: 'Under this formula, usually yes: this page\'s own worked example shows a 25-character lowercase-only passphrase scoring about 117.5 bits, versus about 72.3 bits for an 11-character password using all four character types — length has outsized leverage because entropy multiplies by length but only takes a logarithm of character-set size.' },
        { question: 'Does NIST still recommend forcing symbols and numbers in passwords?', answer: 'No. NIST SP 800-63B states "No other complexity requirements for memorized secrets SHOULD be imposed" and that verifiers "SHOULD NOT impose other composition rules (e.g., requiring mixtures of different character types...)." It emphasizes length (at least 8 characters, ideally up to 64) over forced complexity.' },
        { question: 'Does this tool check my password against breached-password lists?', answer: 'No. This is a static, client-side entropy estimate only. NIST SP 800-63B separately recommends checking new passwords against lists of previously breached or commonly used passwords — this calculator has no such database to check against.' },
        { question: 'Is my password sent anywhere when I type it here?', answer: 'No. Everything runs in your browser; there is no network request, logging, or storage of anything typed into this calculator.' },
        { question: 'Why do emoji or non-English letters make this estimate less accurate?', answer: 'This calculator only tracks a 95-character ASCII set (lowercase, uppercase, digits, standard symbols). A character outside that set still adds to the password\'s length but adds nothing to the character-set size this tool counts, so passwords using those characters are likely underestimated here, not overestimated.' },
        { question: 'What does NIST recommend instead of complexity rules?', answer: 'Longer minimum lengths (SP 800-63B requires at least 8 characters and recommends allowing up to 64), screening against breached/commonly used password lists, and not forcing arbitrary periodic password changes.' }
      ]
    },
    compute() { return {}; }
  }
];
