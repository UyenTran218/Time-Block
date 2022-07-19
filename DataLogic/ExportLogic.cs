using System.IO;
using TimeBlocks.Models;

namespace TimeBlocks.Logic
{
    public static class ExportLogic
    {
        public static bool GenerateExportFile(string filePath, TimeBlockModels timeBlocks)
        {
            using (StreamWriter sw = File.CreateText(filePath))
            {
                string name = "";
                int length = 0;
                string mediaFile = "";
                bool? playBefore = false;
                bool? pauseTimer = false;
                bool? playAfter = false;

                var newLine = string.Format("{0},{1},{2},{3},{4},{5}",
        "Name", "Length", "Media File", "Play Before Timer Begins", "Pause Timer for Media", "Play After Timer Ends");

                sw.WriteLine(newLine);

                foreach (var model in timeBlocks.Models.Values)
                {
                    name = Q(model.Name);
                    length = model.Length;
                   // mediaFile = Q(model.MediaFile);
                    playBefore = model.PlayBefore;
                    pauseTimer = model.PauseTimer;
                    playAfter = model.PlayAfter;

                    newLine = string.Format("{0},{1},{2},{3},{4},{5}",
                        name, length, mediaFile, playBefore, pauseTimer, playAfter);
                    sw.WriteLine(newLine);
                }
            }
            return true;
        }

        private static string Q(string s)
        {
            return "\"" + s + "\"";
        }
    }



}
