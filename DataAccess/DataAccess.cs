using System.Collections.Generic;
using System.Linq;
using TimeBlocks.Models;

namespace TimeBlocks.Data
{
    public class DataAccess
    {
        private SortedList<string, TimeBlock> Data { get; set; }

        public DataAccess()
        {
            Data = new SortedList<string, TimeBlock>();
        }

        public bool AddTimeBlocks(string name, int length,
            string mediaFile, bool playBefore, bool pauseTimer, bool playAfter)
        {
            TimeBlock t = new TimeBlock
            {
                Name = name,
                Length = length,
                TimeElapsed = 0,
                MediaFile = mediaFile,
                PlayBefore = playBefore,
                PauseTimer = pauseTimer,
                PlayAfter = playAfter

            };

            Data.Add(Data.Count.ToString(), t);
            return true;
        }

        public bool AddTimeBlocks(TimeBlock t)
        {
            Data.Add(Data.Count.ToString(), t);
            return true;
        }

        public int AddTimeBlocks(List<TimeBlock> list)
        {
            foreach (TimeBlock t in list)
            {
                Data.Add(Data.Count.ToString(), t);
            }
            return list.Count;
        }

        public TimeBlockModels SelectTimeBlocks()
        {
            return new TimeBlockModels() { Models = Data };
        }

        public TimeBlockModels SelectTimeBlocks(string[] data)
        {
            TimeBlockModels selection = new TimeBlockModels() { Models = new SortedList<string, TimeBlock>() };
            int index = 0;
            foreach (string id in data)
            {
                selection.Models.Add((index++).ToString(), Data[id]);
            }
            return selection;
        }

        public TimeBlock SelectTimeBlocks(int index)
        {
            return Data[index.ToString()];
        }

        public bool RemoveTimeBlock(int index)
        {
            ChangePriority(new PriorityInformation
            {
                RowIndex = index,
                ButtonId = "listButtonBottom"
            });
            return Data.Remove((Data.Count - 1).ToString());
        }

        public bool UpdateTimeBlockTime(int index, int time)
        {
            if (time == 0)
            {
                return true;
            }
            var elem = Data.ElementAt(index).Value;
            elem.TimeElapsed = elem.Length - time;
            return true;
        }

        public bool UpdateMediaElapsed(int index, double time)
        {
            Data.ElementAt(index).Value.MediaFileElapsedTime = time;
            return true;
        }

        public bool ChangePriority(PriorityInformation priorityInformation)
        {
            int index = priorityInformation.RowIndex;

            switch (priorityInformation.ButtonId)
            {
                case "listButtonTop":
                    while ((index = ShiftUp(index)) > 0) { }
                    break;
                case "listButtonUp":
                    ShiftUp(index);
                    break;
                case "listButtonDown":
                    ShiftDown(index);
                    break;
                case "listButtonBottom":
                    while ((index = ShiftDown(index)) < Data.Count - 1) { }
                    break;
            }

            return true;
        }
        private int ShiftUp(int i)
        {
            string row = i.ToString();
            string prev = (--i).ToString();

            var value = Data[prev];

            Data[prev] = Data[row];
            Data[row] = value;
            return i;

        }
        private int ShiftDown(int i)
        {
            string row = i.ToString();
            string next = (++i).ToString();

            var value = Data[next];

            Data[next] = Data[row];
            Data[row] = value;

            return i;
        }
    }


}
