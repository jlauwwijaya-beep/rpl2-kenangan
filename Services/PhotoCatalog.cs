namespace RPL2Kenangan.Services;

public record PhotoItem(string Url, string Category, string FileName, string Key);

public class PhotoCatalog
{
    private readonly object _lock = new();
    private List<PhotoItem> _photos = new();
    private List<string> _categories = new();
    private readonly string _root;

    public PhotoCatalog(IWebHostEnvironment env)
    {
        _root = Path.Combine(env.WebRootPath, "photos");
        Rescan();
    }

    public void Rescan()
    {
        var photos = new List<PhotoItem>();
        var categories = new List<string>();

        if (Directory.Exists(_root))
        {
            foreach (var dir in Directory.GetDirectories(_root).OrderBy(d => d, StringComparer.OrdinalIgnoreCase))
            {
                var category = Path.GetFileName(dir);
                var files = Directory.GetFiles(dir)
                    .Where(IsImage)
                    .OrderBy(f => Path.GetFileName(f), StringComparer.OrdinalIgnoreCase)
                    .ToList();

                if (files.Count == 0) continue;

                categories.Add(category);
                photos.AddRange(files.Select(f =>
                {
                    var name = Path.GetFileName(f);
                    return new PhotoItem(
                        $"/photos/{Uri.EscapeDataString(category)}/{Uri.EscapeDataString(name)}",
                        category,
                        name,
                        $"{category}/{name}");
                }));
            }
        }

        lock (_lock)
        {
            _photos = photos;
            _categories = categories;
        }
    }

    public IReadOnlyList<string> Categories { get { lock (_lock) return _categories; } }
    public IReadOnlyList<PhotoItem> Photos { get { lock (_lock) return _photos; } }
    public int TotalCount { get { lock (_lock) return _photos.Count; } }

    public int CountOf(string category)
    {
        lock (_lock) return _photos.Count(p => p.Category == category);
    }

    public List<PhotoItem> ByCategory(string? category)
    {
        lock (_lock)
        {
            return string.IsNullOrEmpty(category) || category == "Semua"
                ? _photos.ToList()
                : _photos.Where(p => p.Category == category).ToList();
        }
    }

    public static string EmojiFor(string category)
    {
        return category.ToLowerInvariant() switch
        {
            "photoijazahtime" => "🎓",
            "usktime" => "💻",
            "villa" => "🏡",
            "westside" => "🌇",
            "withteacher" => "👩‍🏫",
            "antorium" => "🏛️",
            "kamera aweng" => "📷",
            "our" => "🤍",
            "remakeoppo" => "📱",
            _ => "📸"
        };
    }

    private static bool IsImage(string path)
    {
        var ext = Path.GetExtension(path).ToLowerInvariant();
        return ext is ".jpg" or ".jpeg" or ".png" or ".gif" or ".webp";
    }
}
