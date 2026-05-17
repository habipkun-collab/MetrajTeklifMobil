export interface OrganizationProfile {
  companyName: string
  tagline: string
  addressLine1: string
  addressLine2: string
  city: string
  phone: string
  email: string
  website: string
  taxOffice: string
  taxNo: string
  tradeRegistry: string
  /** data:image/...;base64,... */
  logoBase64: string | null
  quoteFooterNote: string
}

export function emptyOrganizationProfile(): OrganizationProfile {
  return {
    companyName: '',
    tagline: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    phone: '',
    email: '',
    website: '',
    taxOffice: '',
    taxNo: '',
    tradeRegistry: '',
    logoBase64: null,
    quoteFooterNote:
      'Bu belge yaklaşık maliyet çalışmasıdır; kesin keşif ve sözleşme şartları geçerlidir.',
  }
}
