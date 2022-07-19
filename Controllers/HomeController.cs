using System.Web.Mvc;
using TimeBlocks.Data;

namespace TimeBlocks.Controllers
{
    public class HomeController : Controller
    {
        private DataAccess Data
        {
            get
            {
                var data = Session["Data"];
                if (data == null)
                {
                    data = Session["Data"] = new DataAccess();
                }
                return data as DataAccess;
            }

            set
            {
                Session["Data"] = value;
            }
        }

        public ViewResult Index()
        {
            return View(Data.SelectTimeBlocks());
        }

    }
}