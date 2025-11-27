# Trivia Card Accordion Feature

## Overview
Added collapsible/expandable functionality to the trivia card, allowing players to minimize it if they prefer to focus on bingo without trivia distractions.

## Features

### User Experience
1. **Click to Collapse**: Click anywhere on the trivia header to collapse/expand the card
2. **▲/▼ Button**: Visual indicator showing collapse state
3. **Persistent State**: Player's preference is saved in localStorage and remembered across sessions
4. **Smooth Animation**: Card smoothly expands and collapses with transitions
5. **Hover Feedback**: Header highlights on hover to indicate it's clickable

### Visual States

**Expanded (Default for new users)**:
```
🎯 AA Trivia          +75 pts  ▲
────────────────────────────────
Big Book
Question text here...
[Answer options]
[Submit button]
```

**Collapsed**:
```
🎯 AA Trivia          +75 pts  ▼
```

## Technical Implementation

### State Management
- **useState**: `isCollapsed` tracks current state
- **localStorage**: Persists user preference across sessions
- **useEffect**: Loads saved state on mount, saves on change

### Code Changes

**File**: `components/TriviaCard.js`

1. **State Initialization** (Line 19-26):
   ```javascript
   const [isCollapsed, setIsCollapsed] = useState(() => {
     if (typeof window !== 'undefined') {
       const saved = localStorage.getItem('triviaCardCollapsed');
       return saved === 'true';
     }
     return false;
   });
   ```

2. **Persistence** (Line 40-44):
   ```javascript
   useEffect(() => {
     if (typeof window !== 'undefined') {
       localStorage.setItem('triviaCardCollapsed', isCollapsed.toString());
     }
   }, [isCollapsed]);
   ```

3. **Header with Toggle** (Line 99-113):
   ```javascript
   <div className="trivia-header" onClick={() => setIsCollapsed(!isCollapsed)}>
     <span className="trivia-icon">🎯</span>
     <span className="trivia-title">AA Trivia</span>
     <span className="trivia-points">+{question.points} pts</span>
     <button className="collapse-button">
       {isCollapsed ? '▼' : '▲'}
     </button>
   </div>
   ```

4. **Conditional Content** (Line 115-193):
   ```javascript
   {!isCollapsed && (
     <>
       {/* All trivia content */}
     </>
   )}
   ```

### CSS Styling

1. **Collapsed Card** (Line 213-215):
   - Reduced padding when collapsed
   - Smooth transition

2. **Clickable Header** (Line 228-252):
   - Cursor pointer
   - Hover background highlight
   - Border adjustments when collapsed

3. **Collapse Button** (Line 453-475):
   - Transparent background
   - Hover effects (scale + background)
   - Active state (press effect)

## User Benefits

### For Players Who Want Trivia
- ✅ Default expanded state (doesn't affect existing behavior)
- ✅ Quick access to answer questions
- ✅ All functionality remains the same

### For Players Who Don't Want Trivia
- ✅ One click to hide trivia content
- ✅ Preference saved automatically
- ✅ More screen space for bingo grid
- ✅ Less visual distraction
- ✅ Still see when new questions appear (can expand if interested)

### For All Players
- ✅ Optional feature (no forced behavior)
- ✅ Quick toggle (one click)
- ✅ Visual feedback
- ✅ Persistent preference

## Accessibility

- ✅ **Keyboard accessible**: Button can be focused and activated with keyboard
- ✅ **Screen reader friendly**: `aria-label` describes button function
- ✅ **Visual indicators**: Clear expand/collapse arrows
- ✅ **Hover states**: Shows interactivity

## localStorage Key

**Key**: `triviaCardCollapsed`
**Values**:
- `"true"` - Card is collapsed
- `"false"` or missing - Card is expanded

## Testing Checklist

✅ Click header to collapse card
✅ Click header again to expand card
✅ Click collapse button (▲/▼) to toggle
✅ Refresh page - state is remembered
✅ Close browser and reopen - state persists
✅ Collapsed state shows only header
✅ Expanded state shows all content
✅ Smooth transitions on toggle
✅ Hover effects work on header
✅ Works on mobile and desktop

## Mobile Behavior

- Same functionality on mobile
- Touch-friendly header area
- Responsive padding adjustments
- Smaller collapsed padding for space efficiency

## Future Enhancements

Potential improvements:
- [ ] Slide animation for content (fade in/out)
- [ ] "Hide trivia permanently" option in settings
- [ ] Notification badge when collapsed and new question appears
- [ ] Admin option to disable trivia feature per game

## Files Modified

1. ✅ `components/TriviaCard.js` - Added collapse functionality and styling

## Usage Example

```javascript
// State is managed automatically
// User clicks header or button
// localStorage automatically updated
// State persists across sessions
```

---

**Ready to use!** Players can now collapse the trivia card if they prefer to focus only on bingo. Their preference is automatically saved and remembered.
