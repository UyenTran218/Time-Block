using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(TimeBlocks.Startup))]
namespace TimeBlocks
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
