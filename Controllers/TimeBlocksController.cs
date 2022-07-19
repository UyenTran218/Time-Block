/*************************************************************************
 *  TimeBlockController.cs
 *  
 *  Ashley Henson
 *  110116789
 *  Henar004
 *  
 *  &&
 *  
 *  Jacob
 * 
 *  This controller provides the back end functionality to the 
 *  _ListTimeBlocks.cshtml partial view, including; 
 *  creating, removing, prioritising, importing, and exporting.
 *  
 * 
 *************************************************************************/


using System;
using System.Collections.Generic;
using System.IO;
using System.Web;
using System.Web.Mvc;
using TimeBlocks.Data;
using TimeBlocks.Models;
using static TimeBlocks.Logic.ExportLogic;
using static TimeBlocks.Logic.ImportLogic;

namespace TimeBlocks.Controllers
{

    public class TimeBlocksController : Controller
    {






        // Session data for storing the list of TimeBlocks
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






        // Main partial view
        public ActionResult Index()
        {
            return PartialView(Data.SelectTimeBlocks());
        }





        public PartialViewResult CreateNewTimeBlock()
        {
            return PartialView();
        }

        public JsonResult CreateTimeBlock()
        {
            var data = Request.Form;

            TimeBlock t = new TimeBlock()
            {
                Id = 0,
                Name = data["Name"],
                Length = int.Parse(data["Length"]) * 60,
                MediaFile = data["MediaFile"],

                PlayBefore = data["Mode"] == "1",
                PauseTimer = data["Mode"] == "2",
                PlayAfter = data["Mode"] == "3"
            };

            Data.AddTimeBlocks(t);

            return Json(new
            {
                Data = t
            });
        }



        // Importing TimeBlocks by saving to the server, converting the file, then removing the file.
        [HttpPost]
        public JsonResult ImportTimeBlocks()
        {
            var models = new List<TimeBlock>();
            var errorList = new List<string>();
            string filePath = Server.MapPath("~/Content/Temp Files/");
            // For each file in the multiple file upload.
            for (int i = 0; i < Request.Files.Count; i++)
            {
                HttpPostedFileBase file = Request.Files[i];
                if (file != null && file.ContentLength > 0)
                {
                    string fileName = file.FileName;
                    string fullPath = Path.Combine(filePath, fileName);
                    try
                    {
                        // Convert CSV to models and add them to the session data.
                        if (Path.GetExtension(file.FileName).Equals(".csv"))
                        {
                            file.SaveAs(fullPath);
                            string content = System.IO.File.ReadAllText(fullPath);

                            models.AddRange(ReadUploadFile(fileName, content));
                        }
                        else
                        {
                            throw new Exception(fileName + " Failed to Upload: Invalid File Extension.");
                        }
                    }
                    //Catch any errors and delete the bad files.
                    catch (Exception e)
                    {
                        errorList.Add(e.Message);
                        System.IO.File.Delete(fullPath);
                    }
                }
            }

            //Clean up the server, generate and return results.
            CleanUpTempFiles(filePath);

            return Json(new
            {
                TimeBlocks = models,
                Results = GenerateContentString(
                    models.Count,
                    Data.AddTimeBlocks(models),
                    errorList
                    )
            });
        }

        //Export TimeBlocks as CSV files. 
        [HttpPost]
        public string ExportTimeBlocks()
        {
            //Pre clean server to remove last export copy **Couldn't figure this out in time**
            CleanUpTempFiles(Server.MapPath("~/Content/Temp Files/"));

            string fileName = "TimeBlocks " + DateTime.Today.ToString("dd-MM-yy") + ".csv";
            string filePath = Path.Combine(Server.MapPath("~/Content/Temp Files/"), fileName);

            if (GenerateExportFile(filePath,
                Data.SelectTimeBlocks(Request.Form["checkBoxIdString"].Split(','))))
            {
                return Path.Combine("/Content/Temp Files/", fileName);
            }
            else
            {
                return string.Empty;
            }
        }





        //Ajax function to update the priority of a TimeBlock.
        public string UpdateTimeBlocksPriority(PriorityInformation data)
        {
            if (!ModelState.IsValid)
            {
                return "Invalid Model State.";
            }

            Data.ChangePriority(data);
            return data.ButtonId;
        }





        //Gets the next Current TimeBlock.
        public JsonResult UpdateCurrentTimeBlock(NextTimeBlock data)
        {
            if (!ModelState.IsValid)
            {
                return Json("Invalid Model State.");
            }
            else if (data.CurrentRow != -1 &&
                (!Data.UpdateMediaElapsed(data.CurrentRow, data.CurrentMediaTime) ||
                !Data.UpdateTimeBlockTime(data.CurrentRow, data.CurrentTime)))
            {
                return Json("Error updating elapsed time for media.");
            }
            else
            {
                return Json(Data.SelectTimeBlocks(data.NextRow));
            }

        }

        public String RemoveTimeBlock(int rowIndex)
        {
            return Data.RemoveTimeBlock(rowIndex) ? "Success" : "Failure";
        }

    }
}