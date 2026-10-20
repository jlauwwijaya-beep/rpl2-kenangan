using System.Text.Json;

namespace RPL2Kenangan.Services;

public record PhotoComment(string Name, string Text, DateTime At);

public class CommentStore
{
    private readonly string _path;
    private readonly object _lock = new();
    private readonly Dictionary<string, List<PhotoComment>> _data = new();

    public CommentStore(IWebHostEnvironment env)
    {
        var dir = Path.Combine(env.ContentRootPath, "App_Data");
        Directory.CreateDirectory(dir);
        _path = Path.Combine(dir, "comments.json");

        if (File.Exists(_path))
        {
            try
            {
                var json = File.ReadAllText(_path);
                var loaded = JsonSerializer.Deserialize<Dictionary<string, List<PhotoComment>>>(json);
                if (loaded is not null)
                {
                    foreach (var kv in loaded) _data[kv.Key] = kv.Value;
                }
            }
            catch
            {
                // file korup atau format salah: mulai dari kosong
            }
        }
    }

    public List<PhotoComment> Get(string photoKey)
    {
        lock (_lock)
        {
            return _data.TryGetValue(photoKey, out var list)
                ? list.OrderByDescending(c => c.At).ToList()
                : new List<PhotoComment>();
        }
    }

    public int Count(string photoKey)
    {
        lock (_lock)
        {
            return _data.TryGetValue(photoKey, out var list) ? list.Count : 0;
        }
    }

    public void Add(string photoKey, string name, string text)
    {
        lock (_lock)
        {
            if (!_data.TryGetValue(photoKey, out var list))
            {
                list = new List<PhotoComment>();
                _data[photoKey] = list;
            }

            list.Add(new PhotoComment(
                string.IsNullOrWhiteSpace(name) ? "Anonim" : name.Trim(),
                text.Trim(),
                DateTime.Now));

            var json = JsonSerializer.Serialize(
                _data,
                new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(_path, json);
        }
    }
}
