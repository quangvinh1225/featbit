using Domain.Protocol;

namespace Domain.MessageHandlers;

public class EchoMessageHandler : IMessageHandler
{
    public string Type => MessageTypes.Echo;

    public async Task HandleAsync(MessageContext ctx)
    {
        var connection = ctx.Connection;
        var message = ctx.Message;
        var token = ctx.CancellationToken;

        await connection.SendAsync(message, token);
    }
}