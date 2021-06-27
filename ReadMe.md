## BreakOut game

### Helpful tips

- `ionic cap run android` - to run android app
- `npx cap run android` - to run android app

## Some helpful MongoDB commands (terminal)

- `db.games.aggregate([{$group: {_id:"$symbol", each_count: {$sum: 1} }}])` - to group games count by symbol
