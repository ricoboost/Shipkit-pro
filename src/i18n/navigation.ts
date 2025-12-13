/**
 * i18n Navigation Utilities
 * Locale-aware Link, redirect, usePathname, and useRouter
 */

import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
