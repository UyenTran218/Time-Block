using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using TimeBlocks.Models;

namespace TimeBlocks.Logic
{
    public static class ImportLogic
    {
        readonly static HashSet<string> headersSet = new HashSet<string>
        {
            "Name",
            "Length",
            "Media File",
            "Play Before Timer Begins",
            "Pause Timer for Media",
            "Play After Timer Ends"
        };

        public static List<TimeBlock> ReadUploadFile(string fileName, string file)
        {
            List<TimeBlock> blockList = new List<TimeBlock>();

            string[] stringData = file.Split(new char[] { '\n', '\r' }, System.StringSplitOptions.RemoveEmptyEntries);
            string[] headers = stringData[0].Split(',');

            if (headers.Length != headersSet.Count || !headersSet.SetEquals(headers))
            {
                throw new System.Exception(fileName + " failed to upload: Incorrect or Corrupt Header Values.");
            }

            for (int i = 1; i < stringData.Length; i++)
            {
                try
                {
                    string[] blockData = new string[headersSet.Count];
                    char[] charData = stringData[i].ToCharArray();

                    int commaCount = 0;
                    int quoteCount = 0;

                    int indexCurr = 0;
                    int indexPrev = 0;

                    char charPrev = ' ';

                    foreach (char c in charData)
                    {
                        switch (c)
                        {
                            case ',':
                                if ((charPrev == '"' && quoteCount % 2 == 0) ||
                                   quoteCount == 0)
                                {
                                    blockData[commaCount++] = stringData[i].Substring(indexPrev, indexCurr);
                                    quoteCount = 0;
                                    indexPrev += indexCurr + 1;
                                    indexCurr = -1;
                                }
                                break;

                            case '"':
                                quoteCount += 1;
                                break;

                            default:
                                break;
                        }
                        indexCurr++;
                        charPrev = c;
                    }

                    blockData[commaCount] = stringData[i].Substring(indexPrev, indexCurr);

                    if (commaCount != headersSet.Count - 1 || blockData[0] == "" || blockData[1] == "")
                    {
                        throw new Exception();
                    }
                    if (!blockData[0].StartsWith("\"") || !blockData[0].EndsWith("\"") ||
                        blockData[2].Length > 0 && (!blockData[2].StartsWith("\"") || !blockData[2].EndsWith("\"")))
                    {
                        throw new Exception();
                    }
                    else
                    {
                        blockData[0] = blockData[0].Substring(1, blockData[0].Length - 2);
                        blockData[2] = blockData[2].Substring(1, blockData[2].Length - 2);
                    }

                    TimeBlock model = new TimeBlock
                    {
                        Name = blockData[0],
                        Length = int.Parse(blockData[1]),
                        MediaFile = blockData[2],
                        PlayBefore = bool.Parse(blockData[3]),
                        PauseTimer = bool.Parse(blockData[4]),
                        PlayAfter = bool.Parse(blockData[5])
                    };

                    blockList.Add(model);
                }
                catch
                {
                    throw new Exception(fileName + " failed to upload: TimeBlock on line " + (i + 1) + " has missing or invalid data.");
                }
            }
            return blockList;
        }

        public static void CleanUpTempFiles(string path)
        {
            DirectoryInfo dir = new DirectoryInfo(path);
            foreach (FileInfo file in dir.GetFiles())
            {
                if (file.Extension.Equals(".csv"))
                {
                    file.Delete();
                }
            }
        }

        public static string GenerateContentString(int totalRows, int insertedRows, List<string> errors)
        {
            StringBuilder sbContent = new StringBuilder();
            if (insertedRows != 0)
            {
                sbContent.Append(insertedRows + " of " + totalRows + " inserted.\n");
            }
            else
            {
                sbContent.Append("No rows inserted!\n");
            }
            if (errors.Count > 0)
            {
                sbContent.Append("Errors occured while importing:\n");
                foreach (string error in errors)
                {
                    sbContent.Append(error);
                }
            }
            return sbContent.ToString();
        }
    }
}
