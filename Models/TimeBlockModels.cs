using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TimeBlocks.Models
{
    //List of all models
    public class TimeBlockModels
    {
        public SortedList<string, TimeBlock> Models { get; set; }
    }
    //Single block
    public class TimeBlock
    {
        public int Id { get; set; }
        [Required(ErrorMessage = "Please enter a name.")]
        [Display(Name = "Name:")]
        [StringLength(35, ErrorMessage = "Name is too long, 35 chars or less.")]
        public string Name { get; set; }
        [Required]
        [Display(Name = "Length:")]
        [Range(1, 1000, ErrorMessage = "Between 1 and 1000, please.")]
        public int Length { get; set; }
        public int TimeElapsed { get; set; }
        [Display(Name = "Media File:")]
        public string MediaFile { get; set; }
        public double MediaFileElapsedTime { get; set; }
        [Display(Name = "Media Mode:")]
        public MediaPlayerMode Mode { get; set; }
        public bool PlayBefore { get; set; } //Presentation Mode
        public bool PauseTimer { get; set; } //Discussion Mode
        public bool PlayAfter { get; set; } //Wrap Up Mode
    }

    public class PriorityInformation
    {
        public string ButtonId { get; set; }
        public int RowIndex { get; set; }
    }

    public class NextTimeBlock
    {
        public int CurrentTime { get; set; }
        public int CurrentRow { get; set; }
        public double CurrentMediaTime { get; set; }
        public int NextRow { get; set; }
    }

    public enum MediaPlayerMode
    {
        Regular,
        Presentation,
        Discussion,
        Collaboration
    }


}