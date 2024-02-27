import { AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL } from '@/settings/accounts/constants/AvailableTimezoneOptionsByLabel';
import { formatTimeZoneLabel } from '@/settings/accounts/utils/formatTimeZoneLabel';

/**
 * Finds the matching available IANA time zone select option from a given IANA time zone.
 * @param value the IANA time zone to match
 * @returns the matching available IANA time zone select option or undefined
 */
export const findAvailableTimeZoneOption = (value: string) =>
  AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL[formatTimeZoneLabel(value)];
