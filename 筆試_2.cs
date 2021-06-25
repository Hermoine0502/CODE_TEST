
// 第二題
class Solution {
public:
    int RomToInt(string S) {
        int ans = 0, num = 0;
        for (int i = S.size()-1; ~i; i--) {
            switch(S[i]) {
                case 'I': num = 1; break;
                case 'V': num = 5; break;
                case 'X': num = 10; break;
                case 'L': num = 50; break;
                case 'C': num = 100; break;
                case 'D': num = 500; break;
                case 'M': num = 1000; break;
            }
            if (4 * num < ans) ans -= num;
            else ans += num;
        }
        return ans;        
    }
};


// 第四題
class Solution {
public:
    void SortCol(vector<int>& nums) {
        vector<int> colors(3);
        for (int num : nums) ++colors[num];
        for (int i = 0, cur = 0; i < 3; ++i) {
            for (int j = 0; j < colors[i]; ++j) {
                nums[cur++] = i;
            }
        }
    }
};
// 第五題
//  ViewData，ViewBag以及TempData用於將數據從控制器傳遞到視圖和下一個請求。ViewData並且ViewBag幾乎相似並TempData承擔額外的責任。讓我們討論或了解這三個對象的關鍵點

public ActionResult Index()
{
    ViewBag.Name = "hellow world";
    return View();
}

public ActionResult Index()
{
    ViewData["Name"] = "hellow world";
    return View();
}

@ViewBag.Name 
@ViewData["Name"]

// ViewBag&ViewData之間的相似之處：

// 當您從控制器移動到視圖時，有助於維護數據。
// 用於將數據從控制器傳遞到相應的視圖。
// 他們的目標是提供一種在控制器和視圖之間進行通信的方式。它是服務器調用中的一種通信機制。

// ViewBag&ViewData之間的區別：

// ViewData是一個dictionary從ViewDataDictionary類生成的對象，可以使用strings 作為訪問。
// ViewBag 是一個動態屬性，它利用了 C# 4.0 中的新動態特性。
// ViewData需要對複雜數據類型進行類型轉換並檢查null值以避免錯誤。
// ViewBag 不需要對複雜數據類型進行類型轉換。

public ActionResult Index()
{
  var model = new Review()
            {
                Body = "Start",
                Rating=5
            };
    TempData["HellowWorld"] = model;
    return RedirectToAction("About");
}

public ActionResult About() 
{     
    var model= TempData["HellowWorld"];     
    return View(model); 
}
// TempData也是一個dictionary,自TempDataDictionary類並存儲在短期會話中，它是一個string鍵和object值。區別在於對象的生命週期。TempData保留 HTTP 請求時間的信息。意思是只能從一頁到另一頁。這也適用於 302/303 重定向，因為它在同一個 HTTP 請求中。當您從一個控制器移動到另一個控制器或從一個操作移動到另一個操作時，它有助於維護數據。

// 第六題

// action filters可以應用於控制器動作或控制器本身，在action filters的幫助下，我們可以改變動作或控制器的執行方式。
// 並提供以下action filters:
// Output Cache:將操作的輸出緩存一段時間。若將緩存登錄操作的輸出 20 秒（意思是我們給出了 20 秒的持續時間）。
// Handle Error:由動作或控制器引起的錯誤，如果發生任何異常，它將動作重定向到自定義錯誤頁面。
// Authorize:用於過濾授權用戶訪問資源。