/**
 * Waitlist Page Builder Types
 * Type definitions for the visual page builder
 */

// ============== BASE TYPES ==============

export type SectionType = 'hero' | 'bento' | 'how-it-works' | 'footer';

export type GradientDirection =
  | 'to-r'
  | 'to-l'
  | 'to-t'
  | 'to-b'
  | 'to-br'
  | 'to-bl'
  | 'to-tr'
  | 'to-tl';

export interface SpacingConfig {
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
}

export interface GradientConfig {
  from: string;
  to: string;
  direction: GradientDirection;
}

export interface ImageConfig {
  url: string;
  overlay?: string;
  position: 'center' | 'top' | 'bottom';
  size: 'cover' | 'contain';
}

export interface BackgroundConfig {
  type: 'color' | 'gradient' | 'image';
  color?: string;
  gradient?: GradientConfig;
  image?: ImageConfig;
}

export interface BaseSection {
  id: string;
  type: SectionType;
  order: number;
  visible: boolean;
  minHeight?: number;
  background: BackgroundConfig;
  spacing: SpacingConfig;
  customCSS?: string;
  // Custom blocks that can be inserted by users
  customBlocks?: Array<TextBlock | ImageBlock | ButtonBlock>;
}

// ============== ELEMENT DIMENSION TYPES ==============

export interface ElementDimensions {
  width?: string; // e.g., '100%', '300px', 'auto'
  maxWidth?: string;
  minWidth?: string;
  height?: string;
  maxHeight?: string;
  minHeight?: string;
}

export interface ElementSpacing {
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
}

export interface BorderStyle {
  width?: number;
  color?: string;
  radius?: number;
  style?: 'solid' | 'dashed' | 'dotted' | 'none';
}

// ============== CONTENT BLOCK TYPES ==============

export type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'lead' | 'muted' | 'small';
export type TextAlignment = 'left' | 'center' | 'right';
export type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'xl';

export interface TextBlock {
  id: string;
  type: 'text';
  content: string;
  variant: TextVariant;
  alignment: TextAlignment;
  // Typography
  color?: string;
  fontSize?: number; // in px
  fontWeight?: FontWeight;
  lineHeight?: number; // multiplier e.g., 1.5
  letterSpacing?: number; // in px
  // Dimensions & spacing
  dimensions?: ElementDimensions;
  spacing?: ElementSpacing;
}

export interface ButtonBlock {
  id: string;
  type: 'button';
  text: string;
  variant: ButtonVariant;
  size: ButtonSize;
  action: 'subscribe' | 'link';
  href?: string;
  openNewTab?: boolean;
  // Styling
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
  // Dimensions & spacing
  dimensions?: ElementDimensions;
  spacing?: ElementSpacing;
}

export interface ImageBlock {
  id: string;
  type: 'image';
  src: string;
  alt: string;
  // Dimensions
  width?: number;
  height?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  // Styling
  borderRadius?: number;
  border?: BorderStyle;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  // Spacing
  spacing?: ElementSpacing;
}

export interface IconBlock {
  id: string;
  type: 'icon';
  name: string;
  size: number;
  color?: string;
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
}

export interface InputStyle {
  backgroundColor?: string;
  textColor?: string;
  placeholderColor?: string;
  borderColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  fontSize?: number;
  height?: number;
  width?: string;
}

export interface SubscribeFormBlock {
  id: string;
  type: 'subscribe-form';
  placeholder: string;
  buttonText: string;
  successMessage: string;
  source: string;
  tags: string[];
  // Layout
  layout?: 'inline' | 'stacked';
  gap?: number;
  // Input styling
  inputStyle?: InputStyle;
  // Button styling
  buttonStyle?: {
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: number;
    fontSize?: number;
    fontWeight?: FontWeight;
    paddingX?: number;
    paddingY?: number;
  };
  // Container dimensions
  dimensions?: ElementDimensions;
  spacing?: ElementSpacing;
}

export type ContentBlock =
  | TextBlock
  | ButtonBlock
  | ImageBlock
  | IconBlock
  | SubscribeFormBlock;

// Insertable blocks that users can add to any section
export type InsertableBlock = TextBlock | ImageBlock | ButtonBlock;

// ============== SECTION-SPECIFIC CONFIGS ==============

export interface HeroContent {
  headline: TextBlock;
  subheadline: TextBlock;
  cta: ButtonBlock | SubscribeFormBlock;
  badge?: TextBlock;
  image?: ImageBlock;
}

export interface HeroSection extends BaseSection {
  type: 'hero';
  content: HeroContent;
}

export interface BentoGridItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  image?: string;
  colSpan?: 1 | 2;
  rowSpan?: 1 | 2;
  background?: BackgroundConfig;
}

export interface BentoContent {
  title?: TextBlock;
  subtitle?: TextBlock;
  items: BentoGridItem[];
  columns: 2 | 3 | 4;
}

export interface BentoSection extends BaseSection {
  type: 'bento';
  content: BentoContent;
}

export interface HowItWorksStep {
  id: string;
  number: number;
  title: string;
  description: string;
  icon?: string;
}

export interface HowItWorksContent {
  title?: TextBlock;
  subtitle?: TextBlock;
  steps: HowItWorksStep[];
  layout: 'horizontal' | 'vertical';
}

export interface HowItWorksSection extends BaseSection {
  type: 'how-it-works';
  content: HowItWorksContent;
}

export interface FooterLink {
  id: string;
  text: string;
  href: string;
}

export interface SocialLinks {
  twitter?: string;
  github?: string;
  linkedin?: string;
  instagram?: string;
}

export interface FooterContent {
  copyright: string;
  links: FooterLink[];
  showSocial: boolean;
  socialLinks?: SocialLinks;
}

export interface FooterSection extends BaseSection {
  type: 'footer';
  content: FooterContent;
}

export type PageSection =
  | HeroSection
  | BentoSection
  | HowItWorksSection
  | FooterSection;

// ============== PAGE CONFIG ==============

export type MaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export interface GlobalStyles {
  fontFamily?: string;
  maxWidth: MaxWidth;
}

export interface WaitlistPageConfig {
  version: number;
  sections: PageSection[];
  globalStyles: GlobalStyles;
}

// ============== EDITOR STATE ==============

export interface EditorState {
  config: WaitlistPageConfig;
  selectedSectionId: string | null;
  selectedBlockId: string | null;
  isDirty: boolean;
  isPreviewMode: boolean;
  isSaving: boolean;
  isPublishing: boolean;
}

// ============== API TYPES ==============

export interface WaitlistPageData {
  id: string;
  config: WaitlistPageConfig;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaveWaitlistPageInput {
  config: WaitlistPageConfig;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

export interface PublishWaitlistPageInput {
  publish: boolean;
}
