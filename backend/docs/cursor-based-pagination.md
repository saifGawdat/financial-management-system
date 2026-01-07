# Cursor-Based Pagination - Bonus Documentation

## Overview (نظرة عامة)

Cursor-based pagination is an alternative to offset-based pagination that offers better performance for large datasets. Instead of using `skip()` which becomes slower as the offset increases, cursor-based pagination uses a unique identifier (cursor) to mark the position in the dataset.

## How It Works (كيف يعمل)

### Offset-Based (Current Implementation)

```javascript
// الطريقة الحالية: استخدام skip و limit
// Current method: using skip and limit
const skip = (page - 1) * limit;
const employees = await Employee.find({ user: userId })
  .sort({ createdAt: -1 })
  .skip(skip) // ⚠️ يصبح بطيئاً مع الأرقام الكبيرة
  .limit(limit);
```

**Problem (المشكلة):** When `skip` is large (e.g., page 100 with 10 items per page = skip 990), MongoDB must scan through 990 documents before returning results.

### Cursor-Based (Alternative)

```javascript
// الطريقة البديلة: استخدام المؤشر (Cursor)
// Alternative method: using cursor
const employees = await Employee.find({
  user: userId,
  createdAt: { $lt: cursor }, // البحث عن السجلات الأقدم من المؤشر
})
  .sort({ createdAt: -1 })
  .limit(limit);
```

**Benefit (الفائدة):** MongoDB can use the index directly without scanning previous documents, making it consistently fast regardless of position in the dataset.

## Implementation Example (مثال التطبيق)

### Backend Controller

```javascript
// الحصول على الموظفين باستخدام الترقيم المبني على المؤشر
// Get employees using cursor-based pagination
const getEmployeesCursor = async (req, res) => {
  try {
    // استخراج المؤشر والحد من معاملات الاستعلام
    // Extract cursor and limit from query parameters
    const cursor = req.query.cursor; // تاريخ آخر عنصر من الصفحة السابقة
    const limit = parseInt(req.query.limit) || 10;

    // التحقق من صحة الحد
    // Validate limit
    const validatedLimit = limit < 1 ? 10 : limit > 100 ? 100 : limit;

    // بناء شرط الاستعلام
    // Build query condition
    const query = { user: req.userId };

    // إذا كان هناك مؤشر، أضف شرط للحصول على السجلات الأقدم منه
    // If cursor exists, add condition to get records older than it
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    // جلب الموظفين
    // Fetch employees
    const employees = await Employee.find(query)
      .sort({ createdAt: -1 }) // ترتيب تنازلي حسب تاريخ الإنشاء
      .limit(validatedLimit + 1) // جلب عنصر إضافي للتحقق من وجود صفحة تالية
      .select("name salary jobTitle phoneNumber dateJoined isActive")
      .lean();

    // التحقق من وجود صفحة تالية
    // Check if there's a next page
    const hasNextPage = employees.length > validatedLimit;

    // إزالة العنصر الإضافي إذا كان موجوداً
    // Remove the extra item if it exists
    if (hasNextPage) {
      employees.pop();
    }

    // الحصول على المؤشر التالي (تاريخ آخر عنصر في الصفحة الحالية)
    // Get next cursor (createdAt of last item in current page)
    const nextCursor =
      employees.length > 0 ? employees[employees.length - 1].createdAt : null;

    // إرجاع البيانات مع معلومات المؤشر
    // Return data with cursor information
    res.json({
      data: employees,
      pagination: {
        nextCursor: hasNextPage ? nextCursor : null,
        hasNextPage: hasNextPage,
        itemsPerPage: validatedLimit,
      },
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Server error" });
  }
};
```

### Frontend API Call

```javascript
// جلب الموظفين باستخدام المؤشر
// Fetch employees using cursor
export const getEmployeesCursor = async (cursor = null, limit = 10) => {
  const params = new URLSearchParams({ limit: limit.toString() });

  // إضافة المؤشر إذا كان موجوداً
  // Add cursor if it exists
  if (cursor) {
    params.append("cursor", cursor);
  }

  const response = await axios.get(`/employee/cursor?${params.toString()}`);
  return response.data;
};
```

### Frontend Component State

```javascript
// حالة الترقيم بالمؤشر
// Cursor pagination state
const [employees, setEmployees] = useState([]);
const [nextCursor, setNextCursor] = useState(null);
const [hasNextPage, setHasNextPage] = useState(false);
const [previousCursors, setPreviousCursors] = useState([]); // لتتبع الصفحات السابقة

// جلب الصفحة التالية
// Fetch next page
const handleNextPage = async () => {
  const response = await getEmployeesCursor(nextCursor, 10);
  setPreviousCursors([...previousCursors, nextCursor]); // حفظ المؤشر الحالي
  setEmployees(response.data);
  setNextCursor(response.pagination.nextCursor);
  setHasNextPage(response.pagination.hasNextPage);
};

// العودة للصفحة السابقة
// Go to previous page
const handlePreviousPage = async () => {
  const prevCursor = previousCursors[previousCursors.length - 1];
  const response = await getEmployeesCursor(prevCursor, 10);
  setPreviousCursors(previousCursors.slice(0, -1)); // إزالة آخر مؤشر
  setEmployees(response.data);
  setNextCursor(response.pagination.nextCursor);
  setHasNextPage(response.pagination.hasNextPage);
};
```

## Performance Comparison (مقارنة الأداء)

| Scenario                   | Offset-Based   | Cursor-Based |
| -------------------------- | -------------- | ------------ |
| **Page 1** (0-10)          | Fast ⚡        | Fast ⚡      |
| **Page 10** (90-100)       | Medium 🟡      | Fast ⚡      |
| **Page 100** (990-1000)    | Slow 🔴        | Fast ⚡      |
| **Page 1000** (9990-10000) | Very Slow 🔴🔴 | Fast ⚡      |

## When to Use Each (متى تستخدم كل طريقة)

### Offset-Based (الترقيم بالإزاحة)

✅ **Use when:**

- Need to jump to specific page numbers
- Dataset is small to medium (<10,000 records)
- Users need to see total page count
- Implementing traditional pagination UI (1, 2, 3, ...)

### Cursor-Based (الترقيم بالمؤشر)

✅ **Use when:**

- Dataset is very large (>100,000 records)
- Implementing infinite scroll
- Performance is critical
- Data changes frequently (new records added often)

❌ **Limitations:**

- Cannot jump to arbitrary page numbers
- Cannot show total page count easily
- More complex to implement "Previous" button

## Conclusion (الخلاصة)

For this employee management system, **offset-based pagination is appropriate** because:

1. Employee count is typically manageable (<10,000)
2. Users benefit from seeing page numbers
3. Simpler implementation and UX

However, if the system scales to handle 100,000+ employees or needs infinite scroll, cursor-based pagination would be the better choice.
