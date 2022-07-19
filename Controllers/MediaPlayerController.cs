using System.Web.Mvc;
using TimeBlocks.Data;

namespace TimeBlocks.Controllers
{
    public class MediaPlayerController : Controller
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

        public ActionResult MediaPlayer(int index = 0)
        {
            return PartialView(Data.SelectTimeBlocks(index));
        }

    }
}