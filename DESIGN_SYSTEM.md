# Moniva App Design System

This document contains all design specifications, fonts, colors, spacing, and component styles used in the Moniva app for Figma reference.

---

## **Typography**

### **Font Family**

- **Primary Font**: Rubik
  - `font-rubik` - Regular (400)
  - `font-rubik-light` - Light (300)
  - `font-rubik-medium` - Medium (500)
  - `font-rubik-semibold` - SemiBold (600)

### **Font Sizes**

- `text-xs` - 12px (0.75rem)
- `text-sm` - 14px (0.875rem)
- `text-base` - 16px (1rem)
- `text-lg` - 18px (1.125rem)
- `text-xl` - 20px (1.25rem)
- `text-2xl` - 24px (1.5rem)
- `text-3xl` - 30px (1.875rem)

### **Typography Usage**

#### **Headers**

- **Main Screen Titles**: `text-2xl font-rubik-semibold`
- **Form Titles**: `text-xl font-rubik-semibold`
- **Section Headers**: `text-sm font-rubik-medium text-black-300`
- **Subtitles**: `text-xs font-rubik-light text-gray-700`

#### **Body Text**

- **Primary Text**: `text-base font-rubik text-black`
- **Card Titles**: `text-lg font-rubik-semibold`
- **Card Labels**: `text-xs font-rubik text-gray-700`
- **Input Text**: `text-base font-rubik`
- **Placeholder**: `text-base font-rubik text-gray-400 (#999)`

#### **Numbers/Amounts**

- **Large Amounts**: `text-3xl font-rubik-semibold`
- **Medium Amounts**: `text-2xl font-rubik-semibold`
- **Card Amounts**: `text-lg font-rubik-semibold` or `text-xl font-rubik-semibold`
- **Small Details**: `text-sm font-rubik`

---

## **Color Palette**

### **Primary Colors**

- **Yellow/Gold (Accent)**: `#ffd33d`
- **Blue (Primary Action)**: `#3b82f6` (rgb(59, 130, 246))
- **Red (Danger/Bills)**: `#ef233c` (rgb(239, 35, 60))
- **Green (Income/Success)**: `#10b981` (rgb(16, 185, 129))
- **Orange (Warning/Due)**: `#fb923c` (rgb(251, 146, 60))

### **Background Colors**

- **Main Background**: `#ffffff` (White)
- **Card Background**: `#ffffff` (White)
- **Blue Background**: `#eff6ff` (Blue-50)
- **Green Background**: `#f0fdf4` (Green-50)
- **Orange Background**: `#fff7ed` (Orange-50)

### **Text Colors**

- **Primary Text**: `#000000` (Black)
- **Secondary Text**: `#666666` (Gray-600)
- **Tertiary Text**: `#999999` (Gray-400)
- **Light Text**: `#6b7280` (Gray-700)
- **Black-300**: `rgba(0, 0, 0, 0.3)` or similar gray

### **Border Colors**

- **Default Border**: `#d1d5db` (Gray-300)
- **Active Border**: `#3b82f6` (Blue-500)
- **Yellow Border**: `#ffd33d`

### **Status Colors**

- **Success Green**: `#10b981`
- **Warning Orange**: `#fb923c`
- **Error Red**: `#ef233c`
- **Info Blue**: `#3b82f6`

---

## **Spacing & Layout**

### **Padding**

- `p-2` - 8px
- `p-3` - 12px
- `p-4` - 16px
- `p-5` - 20px
- `px-3` - Horizontal 12px
- `px-4` - Horizontal 16px
- `px-5` - Horizontal 20px
- `py-2` - Vertical 8px
- `py-3` - Vertical 12px
- `py-4` - Vertical 16px

### **Margins**

- `mt-1` - 4px (margin-top)
- `mt-2` - 8px
- `mt-3` - 12px
- `mt-4` - 16px
- `mt-6` - 24px
- `mb-2` - 8px (margin-bottom)
- `mb-3` - 12px
- `mb-4` - 16px
- `mb-6` - 24px

### **Gaps**

- `gap-3` - 12px
- `gap-4` - 16px

---

## **Border Radius**

- `rounded-xl` - 12px (0.75rem)
- `rounded-2xl` - 16px (1rem)
- `rounded-lg` - 8px (0.5rem)

---

## **Shadows**

### **Card Shadow**

```
shadow-md shadow-black/10
```

- Shadow color: Black with 10% opacity
- Elevation: Medium

---

## **Component Styles**

### **1. Screen Headers**

#### **Main Screen Header** (Bills, Income, Transaction)

```
Container:
- Padding: px-5 pt-8 (20px horizontal, 32px top)
- Flex: flex-row justify-between items-center

Title:
- Font: text-2xl font-rubik-semibold
- Color: Black

Subtitle:
- Font: text-xs font-rubik-light
- Color: text-gray-700

Add Button Icon:
- Icon: add-circle
- Size: 32px
- Color: #ffd33d
```

#### **Form Screen Header** (Add/Edit Forms)

```
Container:
- Padding: px-5 pt-3 (20px horizontal, 12px top)

Title:
- Font: text-xl font-rubik-semibold
- Color: Black

Subtitle:
- Font: text-xs font-rubik-light
- Color: text-gray-700
- Margin: mb-2
```

---

### **2. Summary Cards**

#### **Total Card** (Bills/Income)

```
Container:
- Background: bg-white
- Border Radius: rounded-2xl
- Shadow: shadow-md shadow-black/10
- Padding: p-4
- Layout: flex-row justify-between

Left Section:
- Label: font-rubik text-xs text-gray-700
- Amount: font-rubik-semibold text-3xl py-2 text-black
- Description: font-rubik-light text-xs text-gray-700

Right Section (Icon):
- Icon: dollar
- Size: 32px
- Color: #ef233c (bills) or #10b981 (income)
```

#### **Weekly Savings Card**

```
Container:
- Background: bg-blue-50
- Border Radius: rounded-2xl
- Shadow: shadow-md shadow-black/10
- Padding: p-4

Label: font-rubik text-xs text-gray-700
Amount: font-rubik-semibold text-2xl py-2 text-blue-600
Details: font-rubik-light text-xs text-gray-700
```

#### **Transaction Stats Cards** (Side by side)

```
Container:
- Width: flex-1
- Background: bg-white
- Border Radius: rounded-xl
- Shadow: shadow-md shadow-black/10
- Padding: p-3

Label: font-rubik text-xs text-gray-700
Amount: font-rubik-semibold text-lg text-black py-2
Details: font-rubik-light text-xs text-gray-700
```

---

### **3. Bill/Income/Transaction Cards**

#### **Bill Card** (Unpaid)

```
Container:
- Background: bg-white
- Border Radius: rounded-2xl
- Shadow: shadow-md shadow-black/10
- Padding: p-4
- Margin Bottom: mb-3

Layout:
- flex-row justify-between items-start

Left Section:
- Title: font-rubik-semibold text-lg text-black
- Date: font-rubik-light text-xs text-gray-700 mt-1

Right Section:
- Amount: font-rubik-semibold text-xl text-black
- Mark Paid Button: bg-green-600 rounded-full px-3 py-1
```

#### **Bill Card** (Due This Week - Orange variant)

```
Container:
- Background: bg-orange-50
- Border Radius: rounded-2xl
- Shadow: shadow-md shadow-black/10
- Padding: p-3
- Margin Bottom: mb-3

Amount Color: text-orange-600
```

#### **Bill Card** (Paid - Gray variant)

```
Container:
- Background: bg-gray-50
- Border Radius: rounded-2xl
- Shadow: shadow-md shadow-black/10
- Padding: p-4
- Margin Bottom: mb-3

Amount Color: text-gray-600
Button: bg-orange-500 (Mark Unpaid)
```

#### **Income Card** (Green variant)

```
Container:
- Background: bg-green-50
- Border Radius: rounded-2xl
- Shadow: shadow-md shadow-black/10
- Padding: p-4
- Margin Bottom: mb-3

Left Section:
- Title: font-rubik-semibold text-lg text-black
- Details: font-rubik text-xs text-gray-600

Right Section:
- Amount: font-rubik-semibold text-xl text-green-600
```

#### **Transaction Card** (White variant)

```
Container:
- Background: bg-white
- Border Radius: rounded-2xl
- Shadow: shadow-md shadow-black/10
- Padding: p-3
- Margin Bottom: mb-2

Left Section:
- Title: font-rubik text-base text-black
- Category: text-xs font-rubik text-gray-700 mt-1

Right Section:
- Amount: font-rubik-semibold text-lg text-black
```

---

### **4. Form Input Fields**

#### **Text Input Box**

```
Container:
- Background: bg-white
- Border Radius: rounded-2xl
- Shadow: shadow-md shadow-black/10
- Padding: px-3 py-3

Label (Above):
- Font: text-sm font-rubik text-black-300
- Margin Bottom: mb-1

Input:
- Font: text-base font-rubik
- Placeholder Color: #999
- Min Height: 20px
```

#### **Category Grid** (Transaction)

```
Container:
- Layout: flex-row flex-wrap justify-between

Item:
- Width: w-[30%] (30% of container)
- Background: bg-white
- Border Radius: rounded-xl
- Shadow: shadow-md shadow-black/10
- Padding: p-2
- Margin Bottom: mb-2
- Alignment: items-center

Active State:
- Border: border-2 border-blue-500

Icon:
- Size: 22px
- Color: #3b82f6 (active) or #666 (inactive)

Text:
- Font: text-xs font-rubik
- Color: text-blue-500 (active) or text-gray-700 (inactive)
```

#### **Frequency Grid** (Bills/Income)

```
Container:
- Layout: flex-row flex-wrap justify-between

Item:
- Width: w-[48%] (48% of container - 2 columns)
- Background: bg-white
- Border Radius: rounded-xl
- Shadow: shadow-md shadow-black/10
- Padding: p-3
- Margin Bottom: mb-2
- Alignment: items-center

Active State:
- Border: border-2 border-blue-500

Text:
- Font: text-sm font-rubik
- Color: text-blue-500 font-rubik-semibold (active)
- Color: text-gray-700 (inactive)
```

#### **Date Picker Box**

```
Container:
- Background: bg-white
- Border Radius: rounded-2xl
- Shadow: shadow-md shadow-black/10
- Padding: px-3 py-3
- Layout: flex-row items-center justify-between

Label (Above):
- Font: text-sm font-rubik text-black-300
- Margin Bottom: mb-1

Date Text:
- Font: text-base font-rubik text-gray-700

Icon:
- Icon: calendar-outline
- Size: 20px
- Color: #666
```

---

### **5. Buttons**

#### **Primary Button** (Blue)

```
Background: bg-blue-500
Text: text-sm font-rubik-medium text-white
Border Radius: rounded-xl
Padding: py-3
Layout: items-center
Width: flex-1

Disabled State:
- Opacity reduced
- Shows "Saving..." text
```

#### **Secondary Button** (Gray/Cancel)

```
Background: bg-gray-200
Text: text-sm font-rubik-medium text-gray-700
Border Radius: rounded-xl
Padding: py-3
Layout: items-center
Width: flex-1
```

#### **Mark Paid Button** (Green pill)

```
Background: bg-green-600
Text: text-xs font-rubik-medium text-white
Border Radius: rounded-full
Padding: px-3 py-1
Position: Top-right of card
```

#### **Mark Unpaid Button** (Orange pill)

```
Background: bg-orange-500
Text: text-xs font-rubik-medium text-white
Border Radius: rounded-full
Padding: px-3 py-1
Position: Top-right of card
```

---

### **6. Search Bar**

```
Container:
- Background: bg-white
- Border Radius: rounded-2xl
- Shadow: shadow-md shadow-black/10
- Padding: px-3 py-3
- Layout: flex-row items-center

Icon:
- Icon: search
- Size: 20px
- Color: #666
- Margin Right: ml-3

Input:
- Font: text-base font-rubik
- Placeholder: "Search transactions"
- Placeholder Color: #999
- Width: flex-1

Clear Button:
- Icon: close-circle
- Size: 20px
- Color: #999
```

---

### **7. Section Headers**

```
Font: font-rubik-medium text-sm text-black-300
Padding: px-5 mt-4 mb-2
Shows count in parentheses: "Upcoming Bills (5)"
```

---

### **8. Swipeable Row Actions**

#### **Left Action** (Edit - Blue)

```
Background: #3b82f6
Icon: pencil or edit
Color: White
Size: 24px
```

#### **Right Action** (Delete - Red)

```
Background: #ef233c
Icon: trash-outline
Color: White
Size: 24px
```

---

## **Screen Layouts**

### **Safe Area Padding**

- All screens: `bg-[#ffffff]` (white background)

### **Common Patterns**

#### **List View** (Bills, Income, Transactions)

```
1. Header (pt-8 px-5)
   - Title + Subtitle
   - Add button (top-right)

2. Summary Cards (mt-3 px-5)
   - Total/Stats cards

3. Section Header (mt-4 mb-2 px-5)
   - Label with count

4. List Items (px-5 mb-4)
   - Individual cards
   - Swipeable
```

#### **Form View** (Add/Edit screens)

```
1. Close Button (top-left, p-2)
   - Icon: close, size: 28px

2. Header (pt-3 px-5)
   - Title + Subtitle

3. Form Fields (px-5 mt-2)
   - Each field with label above
   - Spacing: mt-3 between fields

4. Buttons (mt-6 mb-4)
   - Cancel + Action side-by-side
   - Gap: gap-3
```

---

## **Icon Sizes**

- **Large Icons** (Add button): 32px
- **Medium Icons** (UI elements): 24px
- **Small Icons** (Category, Date): 20-22px
- **Close Button**: 28px

---

## **Common Icons Used**

### **Ionicons**

- `add-circle` - Add button
- `close` - Close button
- `calendar-outline` - Date picker
- `search` - Search bar
- `close-circle` - Clear search
- `trash-outline` - Delete
- `pencil` or `edit` - Edit

### **FontAwesome**

- `dollar` - Money/Amount icon
- `edit` - Edit action

---

## **Animation & Interactions**

### **Swipe Gestures**

- Swipe Right: Edit (Blue background)
- Swipe Left: Delete (Red background)
- Spring animation with damping

### **Button Press**

- `activeOpacity={0.7}` - Slight fade on press

---

## **Grid Layouts**

### **Category Grid** (3 columns)

- Column Width: 30%
- Gap: Space between handled by `justify-between`
- Items per row: 3

### **Frequency Grid** (2 columns)

- Column Width: 48%
- Gap: Space between handled by `justify-between`
- Items per row: 2

---

## **Notes for Figma**

1. **Font**: Install Rubik font family (Light, Regular, Medium, SemiBold)
2. **Shadows**: Use drop shadow with 10% black opacity
3. **Border Radius**: Common values are 8px, 12px, and 16px
4. **Spacing Grid**: Use 4px base grid (multiples of 4)
5. **Colors**: Save all colors as styles in Figma
6. **Components**: Create reusable components for cards, buttons, inputs
7. **Auto Layout**: Use auto-layout for flex-row and flex-column patterns

---

## **Color Variables for Figma**

```
Primary/Yellow: #ffd33d
Primary/Blue: #3b82f6
Danger/Red: #ef233c
Success/Green: #10b981
Warning/Orange: #fb923c

Background/White: #ffffff
Background/Blue-50: #eff6ff
Background/Green-50: #f0fdf4
Background/Orange-50: #fff7ed
Background/Gray-50: #f9fafb

Text/Black: #000000
Text/Gray-600: #666666
Text/Gray-400: #999999
Text/Gray-700: #6b7280

Border/Gray-300: #d1d5db
```
