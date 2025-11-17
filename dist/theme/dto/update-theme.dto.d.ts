export declare class UpdateThemeDto {
    name?: string;
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    backgroundImage?: string;
    gradient?: string;
    backgroundType?: 'color' | 'gradient' | 'image';
    mode?: 'light' | 'dark' | 'glass';
    borderStyle?: 'rounded' | 'square';
    cardShadow?: 'none' | 'normal' | 'deep';
    layoutType?: 'full' | 'boxed' | 'minimal' | 'glass';
    isDefault?: boolean;
}
