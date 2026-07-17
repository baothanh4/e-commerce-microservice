# LuxeCommerce Design Specification

This document locks the design system rules for the LuxeCommerce project, adhering to the Hallmark **Editorial** genre standards. All components and pages must inherit from this specification.

## 1. Design System Foundation

*   **Genre**: Editorial (Luxury / Lifestyle Store)
*   **Macrostructure**: Asymmetric grid columns, Bento grids, Fine-border cards, Serif typography pairing.
*   **Theme**: Oat (Warm Cream & Oatmeal hues)
    *   Background Paper: `oklch(96.5% 0.015 85)` (Warm Oat/Cream)
    *   Text Ink: `oklch(22% 0.01 70)` (Deep Charcoal Black)
    *   Accent: `oklch(62% 0.17 38)` (Terracotta Orange)
*   **Typography**:
    *   Display / Headers: `Cormorant Garamond` (Google Serif Font)
    *   UI Elements / Controls: Sans-serif / System font
    *   Metadata / Tags: Monospace (small, uppercase, tracking-wider)
*   **Spacing**: 4-pt grid, fine 1px hairline dividers, generous white spaces.
*   **Motion**:
    *   Entrance: `fadeInUp` animation (`300ms ease-out`)
    *   Gallery / Bento: `zoomSlow` scale hover (`1200ms ease-out`)
*   **CTA Voice**: Mechanical, tactile push buttons (`btn-push` and `btn-push-outline`).

## 2. Global Allowances & Rules

*   **Header & Footer**: MUST be consistent across all user views.
*   **Forms (Auth / Detail)**: Must use clean, thin-bordered inputs with no background or surface-container-lowest background, subtle focus rings.
*   **Dashboard**: Can use denser spacing for data lists, but must maintain the fine borders, monospace labels, and serif page titles.
*   **Contrast / A11y**: High contrast readability between Ink and Oat. Ensure active buttons stand out with Terracotta backgrounds.
